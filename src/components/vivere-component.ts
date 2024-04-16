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

  $element: Element;

  $parent?: VivereComponent;

  $renderController?: RenderController;

  $refs: { [key: string]: (Element | VivereComponent) } = {};

  $passed: { [key: string]: PassedInterface } = {};

  $stored: { [key: string]: StoredInterface } = {};

  $isConnected = false;

  $isDestroyed = false;

  beforeConnected?(): void;
  connected?(): void;

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

    $reactives[key]?.dirty();
  }

  #react(key: string, oldValue: unknown): void {
    const { $stored } = this;

    // If we're storing the value, or have a watcher for the value
    // changing, we need to check to see if the value actually changed
    const storedDefinition = $stored[key];
    const methodName = `on${Utility.pascalCase(key)}Changed`;
    if (this[methodName] != null || storedDefinition != null) {
      const newValue = this[key];

      // All null like values we'll consider the same
      if (newValue == null && oldValue == null)
        return;

      // Check if our property actually changed
      if (newValue !== oldValue) {
        // If we're storing this value, save it to storage
        if (storedDefinition != null)
          Storage.save(key, storedDefinition, newValue);

        // Invoke any watchers
        if (this[methodName] != null)
          this[methodName](oldValue);
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
    // Check bindings
    const method = this.$bindings[event];
    if (method == null)
      throw new ComponentError(`Tried to emit unbound event: ${event}`, this);

    // Invoke the parent's method (if it exists)
    if (this.$parent[method] != null)
      this.$parent[method](arg);
    else
      throw new ComponentError(`Parent does not implement ${method}`, this);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DOM MANIPULATION
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $attach(html: string, ref: string): void {
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

  $connect(): void {
    const { $isConnected, beforeConnected, connected } = this;

    // If this has already been connected, then we don't need to
    // run through all of these commands (because we already have)
    if ($isConnected)
      return;

    // Callback hook
    if (beforeConnected != null)
      beforeConnected.call(this);

    // Load data from storage
    this.#loadStoredData.call(this);

    // Force initial render
    this.$forceRender.call(this, true);

    this.$isConnected = true;

    // Callback hook
    if (connected != null)
      connected.call(this);
  }

  $destroy(shallow = false): void {
    const { $children, $directives, $isDestroyed, $element, $parent, beforeDestroyed, destroyed } = this;

    // If this has already been destroyed (likely because a parent was destroyed), then we
    // don't need to run through all of these commands (because we already have)
    if ($isDestroyed)
      return;

    // Callback hook
    if (beforeDestroyed != null)
      beforeDestroyed.call(this);

    // Destroy directives
    $directives.forEach((d) => d.destroy());

    // Destroy all children (recusive)
    $children.forEach((c) => c.$destroy());

    if (!shallow && $parent != null) {
      // Remove from parent's children
      const childIdx = $parent.$children.indexOf(this);
      if (childIdx >= 0)
        $parent.$children.splice(childIdx, 1);
    }

    // Remove from global component registry
    ComponentRegistry.untrack(this);

    // Remove from DOM
    $element.parentNode.removeChild(this.$element);

    this.$isDestroyed = true;

    // Callback hook
    if (destroyed != null)
      destroyed.call(this);
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
    if (beforeDehydrated != null)
      beforeDehydrated.call(this);

    if (beforeDestroyed != null)
      beforeDestroyed.call(this);

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

    // Callback hooks
    if (dehydrated != null)
      dehydrated.call(this);

    if (destroyed != null)
      destroyed.call(this);
  }
}
