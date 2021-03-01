import Utility from '../lib/utility';
import { Vivere } from '../vivere';
import Reactive from '../reactivity/reactive';
import Walk from '../lib/walk';
import Directive from '../directives/directive';
import Computed from '../reactivity/computed';
import Renderer from '../renderer';
import VivereError from '../error';
import ComponentInterface from './interface';
import Storage from '../reactivity/storage';
import Component from './component';
import ComponentFactory from './component-factory';
import PassedInterface from './definition/passed-interface';
import StoredInterface from './definition/stored-interface';
import Reactable from '../reactivity/reactable';

declare global {
  interface Element {
    $component: Component;
  }
}

export default class ComponentContext implements Reactable {
  $reactives: { [key: string]: Reactive };
  $reserved = ['constructor', 'stored', 'passed', 'arguments', 'caller', 'callee', '__proto__'];

  dataKeys: Set<string>;
  bindings: object;
  children: [ComponentContext?];
  component: Component;
  computeds: { [key: string]: Computed };
  definition: ComponentInterface;
  directives: Set<Directive>;
  element: Element;
  name: string;
  parent?: ComponentContext;
  passed: { [key: string]: PassedInterface };
  refs: { [key: string]: (Element | Component) };
  stored: { [key: string]: StoredInterface };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // CONSTRUCTOR
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  constructor(element: Element, name: string, parent?: ComponentContext) {
    // Load the component definition
    const componentName = Utility.pascalCase(name);
    const definition = Vivere.$getDefinition(componentName);

    if (definition == null)
      throw new VivereError(`Tried to instantiate unknown component ${componentName}`);

    // Initialize component data
    this.$reactives = {};

    this.dataKeys = new Set();
    this.bindings = {};
    this.children = [];
    this.computeds = {};
    this.definition = definition;
    this.directives = new Set();
    this.element = element;
    this.name = componentName;
    this.parent = parent;
    this.passed = {};
    this.refs = {};
    this.stored = {};

    // Set up our component instance, a version of this component
    // only exposing the public interface
    this.component = ComponentFactory(this, definition);
    // Attach the component to the DOM
    element.$component = this.component;

    // Track this component as a child of its parent
    if (parent != null)
      parent.children.push(this);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DEFINITION MANAGEMENT
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $reserveProperty(key: string, descriptor: PropertyDescriptor): void {
    switch (key) {
      case 'passed':
        this.passed = { ...descriptor.value };
        break;
      case 'stored':
        this.stored = { ...descriptor.value };
        break;
      default:
    }
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // REACTIVE DATA
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $set(key: string, value: unknown, component?: Component): void {
    // Fallback to this component if one isn't supplied
    const $component = component || this.component;

    // Turn on reactivity for properties
    const reactive = Reactive.set(this, key, Utility.jsonCopy(value), $component);

    // Listen for changes to this reactive property
    reactive.registerHook(this, (newValue: unknown, oldValue: unknown) => this.react(key, newValue, oldValue));
  }

  compute(key: string, evaluator: () => unknown, component?: Component): void {
    // Fallback to this component if one isn't supplied
    const $component = component || this.component;

    // Initialize the computed property
    const computed = Computed.set(this, key, evaluator, $component);

    // Listen for changes to this computed property
    computed.registerHook(this, (newValue: unknown, oldValue: unknown) => this.react(key, newValue, oldValue));
  }

  pass(key: string, reactive: Reactive): void {
    Reactive.pass(this, key, reactive);
  }

  react(key: string, newValue: unknown, oldValue: unknown): void {
    const { component, stored } = this;

    // Treat undefined and null the same
    if (newValue == null && oldValue == null)
      return;

    // Check if our property actually changed
    if (newValue !== oldValue) {
      // If we're storing this value, save it to storage
      const storedDefinition = stored[key];
      if (storedDefinition != null)
        Storage.save(key, storedDefinition, newValue);

      // Invoke any watchers
      const methodName = `on${Utility.pascalCase(key)}Changed`;
      if (component[methodName])
        component[methodName](newValue, oldValue);
    }
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // STORED DATA
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  loadStoredData(): void {
    // Iterate through our `stored` object to find which objects
    // we expect to be in storage
    Object.entries(this.stored).forEach(([key, definition]) => {
      const storedValue = Storage.retrieve(key, definition);

      // Update the value if we had a stored value
      if (storedValue !== undefined)
        this.$set(key, storedValue);
    });
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // EVENT PASSING
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $emit(event: string, arg: unknown): void {
    // Check bindings
    const method = this.bindings[event];
    this.parent.component[method](arg);
  }

  invokeBinding(event: string, arg: unknown): void {
    const method = this.bindings[event];
    this.component[method](arg);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DOM MANIPULATION
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  $attach(html: string, ref: string): void {
    const $ref = this.refs[ref];
    if ($ref == null)
      throw new VivereError(`No reference named ${ref} found`);

    let element: Element;
    if ($ref instanceof Element)
      element = $ref;
    else
      element = $ref.$element;

    const tempNode = document.createElement('div');
    tempNode.innerHTML = html;

    Object.values(tempNode.children).forEach((child) => {
      element.appendChild(child);
      Walk.tree(child, this);
    });

    // Force a render for children
    this.forceRender();
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // RENDERING
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  queueRender(directive: Directive): void {
    Renderer.$queueRender(directive);
  }

  $nextRender(func: () => void): void {
    Renderer.$nextRender(func);
  }

  forceRender(shallow = false): void {
    this.directives.forEach((d) => Renderer.$queueRender(d));
    if (!shallow) this.children.forEach((child) => child.forceRender());
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // LIFE CYCLE
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  connect(): void {
    const { component, loadStoredData, forceRender } = this;
    const { beforeConnected, connected } = component;

    // Callback hook
    if (beforeConnected != null)
      beforeConnected.bind(component);

    // Load data from storage
    loadStoredData.call(this);

    // Force initial render
    forceRender.call(this, true);

    // Callback hook
    if (connected != null)
      connected.bind(component);
  }

  $destroy(shallow = false): void {
    const { component, children, directives, element, parent } = this;
    const { beforeDestroyed, destroyed } = component;

    // Callback hook
    if (beforeDestroyed != null)
      beforeDestroyed.bind(component);

    // Destroy directives
    directives.forEach((d) => d.destroy());

    // Destroy all children (recusive)
    children.forEach((c) => c.$destroy());

    if (!shallow && parent != null) {
      // Remove from parent's children
      const childIdx = parent.children.indexOf(this);
      if (childIdx >= 0)
        parent.children.splice(childIdx, 1);
    }


    // Remove from global component registry
    Vivere.$untrack(this);

    // Remove from DOM
    element.parentNode.removeChild(this.element);

    // Callback hook
    if (destroyed != null)
      destroyed.bind(component);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DEHYDRATION
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  dehydrateData(): void {
    const { component, dataKeys, element } = this;

    dataKeys.forEach((key) => {
      const kebabKey = Utility.kebabCase(key);
      const value = component[key];
      const jsonValue = JSON.stringify(value);
      element.setAttribute(`v-data:${kebabKey}`, jsonValue);
    });
  }

  dehydrate(shallow = false): void {
    const { component, children, dehydrateData, directives, parent } = this;
    const { beforeDehydrated, dehydrated } = component;

    // Callback hook
    if (beforeDehydrated != null)
      beforeDehydrated.bind(component);

    // Dehydrate this component
    dehydrateData.call(this);
    directives.forEach((d) => { d.dehydrate(); });

    if (!shallow)
      // Dehydrate children
      children.forEach((c) => c.dehydrate());

    // Remove from parent's children
    if (parent != null) {
      const childIdx = parent.children.indexOf(this);
      if (childIdx >= 0)
        parent.children.splice(childIdx, 1);
    }

    // Remove from global component registry
    Vivere.$untrack(this);

    // Callback hook
    if (dehydrated != null)
      dehydrated.bind(component);
  }
}