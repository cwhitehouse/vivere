import Utility from '../lib/utility';
import Reactive from '../reactivity/reactive';
import Walk from '../lib/walk';
import Directive from '../directives/directive';
import Renderer from '../rendering/renderer';
import Storage from '../reactivity/storage';
import StoredInterface from './definition/stored-interface';
import ComponentError from '../errors/component-error';
import ReactiveHost from '../reactivity/reactive-host';
import Properties from '../lib/properties';
import ComponentRegistry from './registry';
import PassedInterface from './definition/passed-interface';
import Evaluator from '../lib/evaluator';
import { RenderController } from '../rendering/render-controller';
import ErrorHandler from '../lib/error-handler';
import { HookConstructor, Hook } from '../hooks/hook';

declare global {
  interface Element {
    $component: VivereComponent;
  }
}

const reservedKeywords = [
  'constructor',
];

export default class VivereComponent extends ReactiveHost {
  #dataKeys: Set<string> = new Set();

  $name: string;

  $bindings: { [key: string]: string } = {};

  $children: [VivereComponent?] = [];

  $directives: Set<Directive> = new Set();

  $hooks: Set<Hook<unknown>> = new Set();

  $element: Element;

  $parent?: VivereComponent;

  $renderController?: RenderController;

  $refs: { [key: string]: (Element | VivereComponent) } = {};

  $passed: { [key: string]: PassedInterface } = {};

  $stored: { [key: string]: StoredInterface } = {};

  $listeners: { [key: string]: ((...args: unknown[]) => unknown)[] } = {};

  $isConnected = false;

  $isDehydrated = false;

  $isDestroyed = false;

  beforeConnected?(): void;
  connected?(): void;

  rendered?(): void;

  beforeDestroyed?(): void;
  destroyed?(): void;

  beforeDehydrated?(): void;
  dehydrated?(): void;

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // CONSTRUCTOR
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  constructor(name: string, element: Element, parent?: VivereComponent, renderController?: RenderController) {
    super();

    // Internals
    this.$name = name;
    this.$element = element;
    this.$parent = parent;
    this.$renderController = renderController;

    // Attach the component to the DOM
    element.$component = this;

    // Track this component as a child of its parent
    if (parent != null)
      parent.$children.push(this);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // HELPER METHODS
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $log(message: string): void {
    // eslint-disable-next-line no-console
    console.log(message);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // REACTIVE DATA
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $setupReactivity(): void {
    // Set up reactivity for all properties
    Properties.parse(this, (key, descriptor) => {
      // Ignore reserved keys, like stored, passed, constructor
      if (reservedKeywords.includes(key))
        return;

      // Make everything reactive
      const { get, set, value } = descriptor;
      this.$set(key, value, get, set);
    });
  }

  $set(key: string, value: unknown, getter: () => unknown = null, setter: (value: unknown) => void = null): Reactive {
    // Functions need not be reactive, and will fail at JSON.stringify
    if (typeof value === 'function')
      return null;

    // Internal properties might not be safe to pass to JSON.stringify
    if (key.startsWith('$') || key.startsWith('#'))
      return null;

    // Turn on reactivity for properties
    const reactive = super.$set(key, Utility.jsonCopy(value), getter, setter);

    // If this is normal data, we need to remember it in #dataKeys
    if (getter == null)
      this.#dataKeys.add(key);

    // Methods and non-reactive properties will return null
    if (reactive == null) return null;

    // Listen for changes to this reactive property
    reactive.registerHook(this, (oldValue: unknown) => this.#react(key, oldValue));

    // Return reactive
    return reactive;
  }

  $pass(key: string, expression: string, index?: number | string): void {
    const { $passed, $reactives } = this;

    let definition = $passed[key];
    if (definition == null) {
      definition = {};
      $passed[key] = definition;
    }

    // Only set up the reactive property the first time $pass
    // is called for a given key
    if (!definition.expression?.length) {
      // If we were storing a default value in our $reactives, we will
      // clear it out for the sake of v-pass
      delete $reactives[key];

      // Passed properties get from their parent, and are unsetable
      this.$set(key, null, () => {
        const { $parent } = this;
        const $definition = this.$passed[key];

        let value = Evaluator.parse($parent, $definition.expression);

        // If it's an array accessor, access the relevant child
        if ($definition.index != null)
          value = value[$definition.index];

        return value;
      }, (value): void => {
        const { $parent } = this;
        // Allow setting $passed values by assigning to the parent
        $parent.$set(expression, value);
      });
    }

    // Store the expression and index
    // in the $passed definition
    definition.expression = expression;
    definition.index = index;
  }

  #listenerForKey(key: string): string {
    return `on${Utility.pascalCase(key)}Changed`;
  }

  #react(key: string, oldValue: unknown): void {
    const { $stored } = this;

    // If we're storing the value, or have a watcher for the value
    // changing, we need to check to see if the value actually changed
    const storedDefinition = $stored[key];
    const methodName = this.#listenerForKey(key);
    if (this.#hasListeners(methodName) || storedDefinition != null) {
      const newValue = this[key];

      // All null like values we'll consider the same
      if (newValue == null && oldValue == null)
        return;

      // Check if our property actually changed
      if (newValue !== oldValue) {
        // If we're storing this value, save it to storage
        if (storedDefinition != null)
          Storage.save(key, storedDefinition, newValue);

        // Invoke any listeners
        this[methodName]?.(newValue, oldValue);
        this.#reportCallback(methodName);
      }
    }
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // STORED DATA
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  #loadStoredData(): void {
    // Iterate through our `stored` object to find which objects
    // we expect to be in storage
    Object.entries(this.$stored).forEach(([key, definition]) => {
      const storedValue = Storage.retrieve(key, definition);
      const defaultValue = definition.default || this[key];

      // Set the data from storage or our fallback value
      this.$set(key, storedValue || defaultValue);
    });
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // EVENT PASSING
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $emit(event: string, arg: unknown): void {
    ErrorHandler.handle(() => {
      // Check bindings
      const method = this.$bindings[event];
      if (method == null)
        throw new ComponentError(`Tried to emit unbound event: ${event}`, this);

      // Invoke the parent's method (if it exists)
      if (this.$parent[method] != null)
        this.$parent[method](arg);
      else
        throw new ComponentError(`Parent does not implement ${method}`, this);
    });
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DOM MANIPULATION
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $attach(html: string, ref: string): void {
    ErrorHandler.handle(() => {
      const $ref = this.$refs[ref];
      if ($ref == null)
        throw new ComponentError(`No reference named ${ref} found`, this);

      let element: Element;
      if ($ref instanceof Element)
        element = $ref;
      else
        element = $ref.$element;

      const tempNode = document.createElement('div');
      tempNode.innerHTML = html;

      Object.values(tempNode.children).forEach((child) => {
        element.appendChild(child);

        if (child instanceof HTMLElement)
          Walk.tree(child, this, this.$renderController);
      });

      // Force a render for children
      this.$forceRender();
    });
  }

  $attachElement(element: HTMLElement, parent: HTMLElement, before?: Node, renderController?: RenderController): void {
    if (before != null)
      parent.insertBefore(element, before);
    else
      parent.appendChild(element);

    // Allow passing a render controller for more control, otherwise pass
    // the components RenderController as we walk the tree
    Walk.tree(element, this, renderController || this.$renderController);

    this.$forceRender();
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // RENDERING
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $queueRender(directive: Directive): void {
    Renderer.$queueRender(directive);
  }

  $nextRender(func: () => void): void {
    Renderer.$nextRender(func);
  }

  $forceRender(shallow = false): void {
    this.$directives.forEach((d) => Renderer.$queueRender(d));
    if (!shallow) this.$children.forEach((child) => child.$forceRender());
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // LIFE CYCLE
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $implements<U, T>(hookConstructor: HookConstructor<U, T>, ...args: U): T {
    if (this.$isConnected || this.$isDehydrated || this.$isDestroyed)
      throw new ComponentError('Hooks must be implemented during the `beforeConnected` callback', this);

    const hook = hookConstructor(this, ...args);
    this.$hooks.add(hook);
    return hook.attach?.();
  }

  $addCallbackListener(callback: string, listener: (...args: unknown[]) => unknown): void {
    this.$listeners[callback] ||= [];
    this.$listeners[callback].push(listener);
  }

  $removeCallbackListener(callback: string, listener: (...args: unknown[]) => unknown): void {
    this.$listeners[callback] = this.$listeners[callback]?.filter((l) => l !== listener);
  }

  #hasListeners(callback: string): boolean {
    return this[callback] != null
      || this.$listeners[callback]?.length > 0;
  }

  #reportCallback(callback: string): void {
    this.$listeners[callback]?.forEach((listener) => {
      listener();
    });
  }

  $setup(): void {
    const { beforeConnected } = this;

    // Callback hooks
    beforeConnected?.call(this);
    this.#reportCallback('beforeConnected');

    // Turn on all of our reactive properties
    this.$setupReactivity();
  }

  $connect(): void {
    const { $isConnected, connected, rendered } = this;

    // If this has already been connected, then we don't need to
    // run through all of these commands (because we already have)
    if ($isConnected)
      return;

    // Load data from storage
    this.#loadStoredData.call(this);

    // Pre-compute all our computed properties with listeners (this
    // is to ensure they are watching any values we care about, even if
    // they aren't ever called directly)
    Object.entries(this.$reactives).forEach(([key, reactive]) => {
      if (reactive.getter != null) {
        // A listener needs to know about updated, but it's existence
        // never otherwise forces the comptued value to compute, therefore
        // we need to kickstart reactivity for the value
        const listenerName = this.#listenerForKey(key);
        if (this.#hasListeners(listenerName))
          reactive.computeValue();
      }
    });

    // Force initial render
    this.$forceRender.call(this, true);

    // Update state tracking
    this.$isConnected = true;
    this.$isDehydrated = false;

    // Callback hook
    connected?.call(this);
    this.#reportCallback('connected');

    // Invoke hook callbacks
    this.$hooks.forEach((h) => { h.connected?.(); });

    this.$nextRender(() => {
      rendered?.call(this);
      this.#reportCallback('rendered');

      // Invoke hook callbacks
      this.$hooks.forEach((h) => { h.rendered?.(); });
    });
  }

  $destroy(): void {
    const { $children, $directives, $isDestroyed, $element, $parent, beforeDestroyed, destroyed } = this;

    // If this has already been destroyed (likely because a parent was destroyed), then we
    // don't need to run through all of these commands (because we already have)
    if ($isDestroyed)
      return;

    // Callback hook
    beforeDestroyed?.call(this);
    this.#reportCallback('beforeDestroyed');
    this.$hooks.forEach((h) => { h.beforeDestroyed?.(); });

    // Destroy directives
    $directives.forEach((d) => d.destroy());

    // Destroy all children (recusive)
    $children.forEach((c) => c.$destroy());

    if ($parent != null) {
      // Remove from parent's children
      const childIdx = $parent.$children.indexOf(this);
      if (childIdx >= 0)
        $parent.$children.splice(childIdx, 1);
    }

    // Remove from global component registry
    ComponentRegistry.untrack(this);

    // Remove from DOM
    $element.parentNode.removeChild(this.$element);

    // Update state tracking
    this.$isDestroyed = true;
    this.$isConnected = false;

    // Callback hook
    destroyed?.call(this);
    this.#reportCallback('destroyed');
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DEHYDRATION
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  #dehydrateData(): void {
    this.#dataKeys.forEach((key) => {
      const kebabKey = Utility.kebabCase(key);
      const value = this[key];
      const jsonValue = JSON.stringify(value);
      this.$element.setAttribute(`v-data:${kebabKey}`, jsonValue);
    });
  }

  $dehydrate(shallow = false): void {
    const { $children, $directives, $parent } = this;
    const { beforeDehydrated, beforeDestroyed, dehydrated, destroyed } = this;

    // Callback hook
    beforeDehydrated?.call(this);
    this.#reportCallback('beforeDehydrated');
    this.$hooks.forEach((h) => { h.beforeDehydrated?.(); });
    beforeDestroyed?.call(this);
    this.#reportCallback('beforeDestroyed');
    this.$hooks.forEach((h) => { h.beforeDestroyed?.(); });

    // Dehydrate this component
    this.#dehydrateData.call(this);
    $directives.forEach((d) => { d.dehydrate(); d.destroy(); });

    if (!shallow)
      // Dehydrate children
      $children.forEach((c) => c.$dehydrate());

    // Remove from parent's children
    if ($parent != null) {
      const childIdx = $parent.$children.indexOf(this);
      if (childIdx >= 0)
        $parent.$children.splice(childIdx, 1);
    }

    // Remove from global component registry
    ComponentRegistry.untrack(this);

    // Update state tracking
    this.$isDehydrated = true;
    this.$isConnected = false;

    // Callback hooks
    dehydrated?.call(this);
    this.#reportCallback('dehydrated');
    destroyed?.call(this);
    this.#reportCallback('destroyed');
  }
}
