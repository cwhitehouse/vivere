import Utility from '../lib/utility';
import Vivere from '../vivere';
import Reactive from '../reactivity/reactive';
import Walk from '../lib/walk';
import Directive from '../directives/directive';
import Computed from '../reactivity/computed';
import Callbacks from './callbacks';
import Renderer from '../renderer';
import VivereError from '../error';
import { ComponentDefintion } from './definition';

declare global {
  interface Element {
    $component: Component;
  }
}

export default class Component {
  $bindings: object;
  $callbacks: Callbacks;
  $children: Set<Component>;
  $computeds: object;
  $definition: ComponentDefintion;
  $directives: Set<Directive>;
  $dirty: boolean;
  $element: Element;
  $name: string;
  $parent?: Component;
  $passed: object;
  $reactives: { prop?: Reactive };
  $refs: object;
  $watchers: object;

  // Constructor

  constructor(element: Element, name: string, parent?: Component) {
    // Load the component definition
    const componentName = Utility.pascalCase(name);
    const definition = Vivere.$getDefinition(componentName);

    if (definition == null)
      throw new VivereError(`Tried to instantiate unknown component ${componentName}`);

    // Initialize component data
    this.$bindings = {};
    this.$callbacks = new Callbacks(definition);
    this.$children = new Set();
    this.$computeds = new Set();
    this.$definition = definition;
    this.$directives = new Set();
    this.$dirty = false;
    this.$element = element;
    this.$name = componentName;
    this.$parent = parent;
    this.$passed = { ...definition.passed };
    this.$reactives = {};
    this.$refs = {};
    this.$watchers = { ...definition.watch };

    // Pass through methods
    Object.assign(this, { ...definition.methods });

    // Setup reactive data
    const { computed, data } = definition;
    if (data != null)
      Object.entries(data()).forEach(([k, v]) => this.$set(k, v));
    if (computed != null)
      Object.entries(computed).forEach(([k, v]) => Computed.set(this, k, v));

    // Attach the component to the DOM
    element.$component = this;

    // Track this component as a child of its parent
    parent?.$children.add(this);
  }


  // Reactivity

  $set(key: string, value: unknown): void {
    // Turn on reactivity for properties
    const reactive = Reactive.set(this, key, value);

    // Listen for changes to this reactive property
    reactive.registerHook(this, () => this.$react(key));
  }

  $pass(key: string, reactive: Reactive): void {
    Reactive.pass(this, key, reactive);
  }

  $react(key: string): void {
    // Invoke any watchers for this property
    this.$watchers[key]?.call(this);
  }


  // Event passing

  $emit(event: string, arg: unknown): void {
    // Check bindings
    const method = this.$bindings[event];
    this.$parent[method](arg);
  }

  $invokeBinding(event: string, arg: unknown): void {
    const method = this.$bindings[event];
    this[method](arg);
  }


  // Append DOM

  $attach(html: string, ref: string): void {
    const element = this.$refs[ref];
    if (element == null)
      throw new VivereError(`No reference named ${ref} found`);

    const tempNode = document.createElement('div');
    tempNode.innerHTML = html;

    Object.values(tempNode.children).forEach((child) => {
      element.appendChild(child);
      Walk.tree(child, this);
    });

    // Force a render for children
    this.forceRender();
  }


  // Rendering

  $queueRender(directive: Directive): void {
    Renderer.$queueRender(directive);
  }

  $nextRender(func: () => void): void {
    Renderer.$nextRender(func);
  }

  forceRender(shallow = false): void {
    this.$directives.forEach((d) => Renderer.$queueRender(d));
    if (!shallow) this.$children.forEach((child) => child.forceRender());
  }


  // Life cycle

  $connect(): void {
    const { $callbacks, forceRender } = this;

    // Callback hook
    $callbacks.beforeConnected?.call(this);

    // Force initial render
    forceRender.call(this, true);

    // Callback hook
    $callbacks.connected?.call(this);
  }

  $destroy(shallow = false): void {
    const { $callbacks, $children, $directives, $element, $parent } = this;
    const { beforeDestroyed, destroyed } = $callbacks;

    // Callback hook
    beforeDestroyed?.call(this);

    // Destroy directives
    $directives.forEach((d) => d.destroy());

    // Destroy all children (recusive)
    $children.forEach((c) => c.$destroy());

    if (!shallow)
      // Remove from parent's children
      $parent?.$children.delete(this);


    // Remove from global component registry
    Vivere.$untrack(this);

    // Remove from DOM
    $element.parentNode.removeChild(this.$element);

    // Callback hook
    destroyed?.call(this);
  }

  $dehydrate(shallow = false): void {
    const { $callbacks, $children, $dehydrateData, $directives, $parent } = this;
    const { beforeDehydrated, dehydrated } = $callbacks;

    // Callback hook
    beforeDehydrated?.call(this);

    // Dehydrate this component
    $dehydrateData.call(this);
    $directives.forEach((d) => { d.dehydrate(); });

    if (!shallow)
      // Dehydrate children
      $children.forEach((c) => c.$destroy());

    // Remove from parent's children
    $parent?.$children.delete(this);

    // Remove from global component registry
    Vivere.$untrack(this);

    // Callback hook
    dehydrated?.call(this);
  }

  $dehydrateData(): void {
    const { $definition, $element } = this;
    const { data } = $definition;

    if (data != null)
      Object.keys(data()).forEach((key) => {
        const kebabKey = Utility.kebabCase(key);
        const jsonValue = JSON.stringify(this[key]);
        $element.setAttribute(`v-data:${kebabKey}`, jsonValue);
      });
  }
}
