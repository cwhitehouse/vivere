import Utility from './lib/utility';
import Vivere from './vivere';
import { Reactive } from './reactivity/reactive';
import Walk from './lib/walk';
import { Directive } from './directives/directive';
import { Computed } from './reactivity/computed';
import Callbacks from './lib/callbacks';
import Renderer from './renderer';

export class Component {
  $bindings:    object;
  $callbacks:   Callbacks;
  $children:    Set<Component>;
  $computeds:   object;
  $directives:  Set<Directive>;
  $dirty:       boolean;
  $element:     HTMLElement;
  $name:        string;
  $parent?:     Component;
  $passed:      object;
  $reactives:   object;
  $refs:        object;
  $watchers:    object;


  // Constructor

  constructor(element: HTMLElement, name: string, parent?: Component) {
    // Load the component definition
    const componentName = Utility.pascalCase(name)
    const definition    = Vivere.$getDefinition(componentName);

    if (definition == null)
      throw `Tried to instantiate unknown component ${componentName}`;

    // Initialize component data
    this.$bindings    = {};
    this.$callbacks   = new Callbacks(definition);
    this.$children    = new Set();
    this.$computeds   = new Set();
    this.$directives  = new Set();
    this.$dirty       = false;
    this.$element     = element;
    this.$name        = componentName;
    this.$parent      = parent;
    this.$passed      = { ...definition.passed };
    this.$reactives   = {};
    this.$refs        = {};
    this.$watchers    = { ...definition.watch };

    // Pass through methods
    Object.assign(this, { ...definition.methods });

    // Setup reactive data
    definition.data?.forEach((k,v) => this.$set(k, v));
    definition.computed?.forEach((k,v) => Computed.set(this, k, v));

    // Attach the component to the DOM
    element.$component = this;

    // Track this component as a child of its parent
    parent?.$children.add(this);
  }


  // Reactivity

  $set(key: string, value: any) {
    // Turn on reactivity for properties
    const reactive = Reactive.set(this, key, value);

    // Listen for changes to this reactive property
    reactive.registerHook(this, (was, is) => this.$react(key, was, is));
  }

  $pass(key: string, reactive: Reactive) {
    Reactive.pass(this, key, reactive);
  }

  $react(key: string, was: any, is: any) {
    // Invoke any watchers for this property
    this.$watchers[key]?.call(this, was, is);
  }


  // Event passing

  $emit(event: string, args: any) {
    // Check bindings
    const method = this.$bindings[event];
    this.$parent[method](args);
  }

  $invokeBinding(event: string, args: any) {
    const method = this.$bindings[event];
    this[method](args);
  }


   // Append DOM

   $attach(html: string, ref: string) {
    const element = this.$refs[ref];
    if (element == null) throw `No reference named ${ref} found`;

    const tempNode = document.createElement('div');
    tempNode.innerHTML = html;

    tempNode.children.forEach((_, child: HTMLElement) => {
      element.appendChild(child);
      Walk.tree(child, this);
    });

    // Force a render for children
    this.forceRender();
   }


  // Rendering

  $queueRender(directive: Directive) {
    Renderer.$queueRender(directive);
  }

  $nextRender(func: Function) {
    Renderer.$nextRender(func);
  }

  forceRender(shallow: boolean = false) {
    this.$directives.forEach(d => Renderer.$queueRender(d));
    if (!shallow)
      this.$children.forEach(child => child.forceRender());
  }


  // Life cycle

  $connect() {
    // Callback hook
    this.$callbacks.beforeConnected?.call(this);

    // Force initial render
    this.forceRender(true);

    // Callback hook
    this.$callbacks.connected?.call(this);
  }

  $destroy() {
    // Callback hook
    this.$callbacks.beforeDestroyed?.call(this);

    // Destroy directives
    this.$directives.forEach(d => d.destroy());

    // Destroy all children (recusive)
    this.$children.forEach(c => c.$destroy());

    // Remove from parent's children
    this.$parent?.$children.delete(this);

    // Remove from global component registry
    Vivere.$untrack(this);

    // Remove from DOM
    this.$element.parentNode.removeChild(this.$element);

    // Callback hook
    this.$callbacks.destroyed?.call(this);
  }
};
