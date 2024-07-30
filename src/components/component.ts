import Utility from '../lib/utility';
import Reactive from '../reactivity/reactive';
import Walk from '../lib/walk';
import Renderer from '../rendering/renderer';
import ComponentError from '../errors/component-error';
import ReactiveHost from '../reactivity/reactive-host';
import Properties from '../lib/properties';
import ComponentRegistry from './registry';
import { RenderController } from '../rendering/render-controller';
import ErrorHandler from '../lib/error-handler';
import Evaluator from '../lib/evaluator';
import { Func } from '../definitions';
import DisplayDirective from '../directives/display/display';
import Directive from '../directives/directive';

declare global {
  interface Element {
    $component: Component;
  }
}

const reservedKeywords = [
  'constructor',
];

export default class Component extends ReactiveHost {
  #dataKeys: Set<string> = new Set();

  $name: string;

  $element: Element;
  $parent?: Component;
  $children: [Component?] = [];

  $renderController?: RenderController;
  $directives: Set<Directive> = new Set();
  $refs: { [key: string]: (Element | Component) } = {};

  #listeners: { [key: string]: Func[] } = {};

  #isConnected = false;
  #isDehydrated = false;
  #isDestroyed = false;

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

  constructor(name: string, element: Element, parent?: Component, renderController?: RenderController) {
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

  /**
   * Finds the closest ancestor component that has a given name. Useful for passing data
   * and events between components. Won't find any sibling or child components.
   * @param name The name of the component we're looking for
   * @returns The first component in the parent chain with that name, or null if there were
   * no matching components
   */
  $find(name: string): Component | null {
    const { $parent } = this;
    if ($parent == null) return null;

    const { $name } = $parent;
    if ($name === Utility.pascalCase(name)) return $parent;

    return $parent.$find(name);
  }

  /**
   * Convenience method for logging (useful from event directives)
   * @param message The mssage to be logged
   */
  $log(message: string): void {
    // eslint-disable-next-line no-console
    console.log(message);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // REACTIVE DATA
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  #setupReactivity(): void {
    // Set up reactivity for all properties
    Properties.parse(this, (key, descriptor) => {
      // Ignore reserved keys, like constructor
      if (reservedKeywords.includes(key))
        return;

      // Make everything reactive
      const { get, set, value } = descriptor;
      this.$set(key, value, get, set);
    });
  }

  $set(key: string, value: unknown, getter: () => unknown = null, setter: (value: unknown) => void = null, override = false): Reactive {
    // Functions need not be reactive, and will fail at JSON.stringify
    if (typeof value === 'function') return null;

    // If we're overriding (like via pass), delete this reactive
    if (override) delete this.$reactives[key];

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

  $proxy(key: string, expression: string): void {
    // eslint-disable-next-line arrow-body-style
    this.$set(key, null, () => {
      return Evaluator.parse(this, expression);
    }, (value: unknown) => {
      Evaluator.assign(this, expression, value);
    }, true);
  }

  #react(key: string, oldValue: unknown): void {
    // If we ave a watcher for the value changing, we need
    // to check to see if the value actually changed
    const methodName = this.#listenerForKey(key);
    if (this.#hasListeners(methodName)) {
      const newValue = this[key];

      // All null like values we'll consider the same
      if (newValue == null && oldValue == null)
        return;

      // Check if our property actually changed
      if (newValue !== oldValue)
        // Invoke any listeners
        this.#reportCallback(methodName);
    }
  }

  #precomputeValues(): void {
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
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // EVENT PASSING
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * Helper method for emitting events that can be handled
   * by other controllers
   * @param event The name of the event (will be automatically prefixed with the component name)
   * @param args Any additional args we want to pass along with the event
   */
  $dispatch(event: string, detail: unknown): void {
    const { $element, $name } = this;

    let eventName: string;
    if ($name?.length) {
      const kebabName = Utility.kebabCase($name);
      eventName = `${kebabName}--${event}`;
    } else
      eventName = event;

    $element.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail,
    }));
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DOM MANIPULATION
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  /**
   * Helper method for attaching new HTML into the DOM and having it automatically be parsed by Vivere
   * @param html A string representing hte html we want to add to the DOM
   * @param ref The name of a ref that we want to attach the HTML to
   */
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

  /**
   * Helper method for attaching a new HTML element ot the DOM and having it automatically parsed by Vivere
   * @param element An HTMLElement we want to add to the DOM
   * @param parent The parent HTMLElement we want to attach our element to
   * @param before And optional `Node` to control where in the parents children the element apepars
   * @param renderController An optional `RenderController` to control rendering of the new element
   */
  $attachElement(element: HTMLElement, parent: HTMLElement, before?: Node, renderController?: RenderController): void {
    if (before != null)
      parent.insertBefore(element, before);
    else
      parent.appendChild(element);

    // Allow passing a render controller for more control, otherwise pass
    // the components RenderController as we walk the tree
    Walk.tree(element, this, renderController || this.$renderController);

    this.$forceRender(false);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // RENDERING
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  get $displayDirectives(): DisplayDirective[] {
    return Array.from(this.$directives).filter((d) => d instanceof DisplayDirective);
  }

  /**
   * Requests an asynchronous render for a specific Directive
   * @param directive The Directive we want to render
   */
  $queueRender(directive: DisplayDirective): void {
    Renderer.$queueRender(directive);
  }

  /**
   * Forces all of this components Directives to re-render
   * @param shallow Controls whether we should force this component's children to re-render as well
   */
  $forceRender(self = true, children = true): void {
    if (self) this.$displayDirectives.forEach((d) => this.$queueRender(d));
    if (children) this.$children.forEach((child) => child.$forceRender());
  }

  /**
   * Helper method for running code the next time a render completes, useful
   * if we need to access say an element that's behind a `v-if` directive
   * @param func The function to be invoked once the render has completed
   */
  $nextRender(func: () => void): void {
    Renderer.$nextRender(func);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // LIFE CYCLE
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Convenience methods for callback listeners

  $connected(listener: Func): void {
    this.$addCallbackListener('connected', listener);
  }

  $rendered(listener: Func): void {
    this.$addCallbackListener('rendered', listener);
  }

  $beforeDestroyed(listener: Func): void {
    this.$addCallbackListener('beforeDestroyed', listener);
  }

  $beforeDehydrated(listener: Func): void {
    this.$addCallbackListener('beforeDehydrated', listener);
  }

  $destroyed(listener: Func): void {
    this.$addCallbackListener('destroyed', listener);
  }

  $dehydrated(listener: Func): void {
    this.$addCallbackListener('dehydrated', listener);
  }

  // Convenience method for watching a property
  $watch(key: string, listener: Func): void {
    this.$addCallbackListener(this.#listenerForKey(key), listener);
  }

  // Managing callback listeners

  $addCallbackListener(callback: string, listener: Func): void {
    this.#listeners[callback] ||= [];
    this.#listeners[callback].push(listener);
  }

  $removeCallbackListener(callback: string, listener: Func): void {
    this.#listeners[callback] = this.#listeners[callback]?.filter((l) => l !== listener);
  }

  #listenerForKey(key: string): string {
    return `on${Utility.pascalCase(key)}Changed`;
  }

  #hasListeners(callback: string): boolean {
    return this[callback] != null
      || this.#listeners[callback]?.length > 0;
  }

  #reportCallback(callback: string): void {
    this[callback]?.call(this);
    this.#listeners[callback]?.forEach((listener) => {
      listener();
    });
  }

  // SETUP

  $$setup(): void {
    const { beforeConnected } = this;

    // Callback hooks
    beforeConnected?.call(this);
    this.#reportCallback('beforeConnected');

    // Turn on all of our reactive properties
    this.#setupReactivity();
  }

  // CONNECTION

  $$connect(): void {
    // If this has already been connected, then we don't need to
    // run through all of these commands (because we already have)
    if (this.#isConnected)
      return;

    this.#precomputeValues();

    // Force initial render
    this.$forceRender.call(this, true, false);

    // Update state tracking
    this.#isConnected = true;
    this.#isDehydrated = false;

    // Callback hooks
    this.#reportCallback('connected');
    this.$nextRender(() => {
      this.#reportCallback('rendered');
    });
  }

  // DESTRUCTION

  $$destroy(): void {
    const { $children, $directives, $element, $parent } = this;

    // If this has already been destroyed (likely because a parent was destroyed), then we
    // don't need to run through all of these commands (because we already have)
    if (this.#isDestroyed)
      return;

    // Callback hook
    this.#reportCallback('beforeDestroyed');

    // Destroy directives
    $directives.forEach((d) => d.destroy());

    // Destroy all children (recusive)
    $children.forEach((c) => c.$$destroy());

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
    this.#isDestroyed = true;
    this.#isConnected = false;

    // Callback hook
    this.#reportCallback('destroyed');
  }

  // DEHYDRATION

  #dehydrateData(): void {
    this.#dataKeys.forEach((key) => {
      const kebabKey = Utility.kebabCase(key);
      const value = this[key];
      const jsonValue = JSON.stringify(value);
      this.$element.setAttribute(`v-data:${kebabKey}`, jsonValue);
    });
  }

  $$dehydrate(shallow = false): void {
    const { $children, $directives, $parent } = this;

    // If this has already dehydrated, ignore
    if (this.#isDehydrated)
      return;

    // Callback hook
    this.#reportCallback('beforeDehydrated');
    this.#reportCallback('beforeDestroyed');

    // Dehydrate this component
    this.#dehydrateData.call(this);
    $directives.forEach((d) => { d.dehydrate(); d.destroy(); });

    if (!shallow)
      // Dehydrate children
      $children.forEach((c) => c.$$dehydrate());

    // Remove from parent's children
    if ($parent != null) {
      const childIdx = $parent.$children.indexOf(this);
      if (childIdx >= 0)
        $parent.$children.splice(childIdx, 1);
    }

    // Remove from global component registry
    ComponentRegistry.untrack(this);

    // Update state tracking
    this.#isDehydrated = true;
    this.#isConnected = false;

    // Callback hooks
    this.#reportCallback('dehydrated');
    this.#reportCallback('destroyed');
  }
}
