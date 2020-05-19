import Utility from './lib/utility';
import Vivere from './vivere';
import { Reactive } from './lib/reactive';
import Walk from './lib/walk';
import { Directive } from './directives/directive';
import { Computed } from './lib/computed';

export class Component {
  $bindings:    object;
  $callbacks:   object;
  $children:    Array<Component>;
  $computeds:   object;
  $directives:  Array<Directive>;
  $element:     HTMLElement;
  $name:        string;
  $parent?:     Component;
  $passed:      object;
  $reactives:   object;
  $refs:        object;
  $ticks:       Array<Function>;
  $watchers:    object;


  // Constructor

  constructor(element: HTMLElement, name: string, parent?: Component) {
    // Load the component definition
    const compName = Utility.pascalCase(name)
    const definition = Vivere.definitions[compName];
    if (definition == null) throw `Tried to instantiate unknown component ${compName}`;

    // Initialize the component data
    Object.assign(this, {
      $bindings: {},
      $callbacks: { ...definition.callbacks },
      $children: [],
      $computeds: {},
      $directives: [],
      $element: element,
      $name: compName,
      $parent: parent,
      $passed: { ...definition.passed },
      $reactives: {},
      $refs: {},
      $ticks: [],
      $watchers: { ...definition.watch },
      ...definition.methods,
    });

    if (definition.data != null) {
      definition.data.forEach((key: string, value: any) => {
        this.$set(key, value);
      });
    }
    if (definition.computed != null) {
      definition.computed.forEach((key: string, value: any) => {
        Computed.set(this, key, value);
      });
    }

    // Attach the component to the DOM
    element.$component = this;

    // Track this component as a child of its parent
    parent?.$children.push(this);
  }


  // Reactivity

  $set(key: string, value: any) {
    // Turn on reactivity for properties
    Reactive.set(this, key, value, (was: any, is: any) => {
      this.$react(key, was, is);
    });
  }

  $pass(key: string, reactive: Reactive) {
    Reactive.pass(this, key, reactive);
  }

  $react(key: string, was: any, is: any) {
    // Watches for changes to any reactive properties
    this.$watchers[key]?.call(this, was, is);
  }


  // Event passing

  $emit(event: string, args: any) {
    // Check bindings
    const method = this.$bindings[event];
    if (method != null) {
      // Pass a message to parent
      this.$parent?.[method]?.(args);

      // Parent may need to re-render
      this.$parent?.render();
    }
  }

  $invokeBinding(event: string, args: any) {
    const method = this.$bindings[event];
    this[method](args);
    this.render();
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
   }


  // Rendering

  $nextRender(func: Function) {
    this.$ticks.push(func);
  }

  render() {
    // Before callback
    this.beforeRendered?.();

    // Evaluate all the directives
    this.$directives.forEach(d => d.evaluate());

    // Render all children
    this.$children.forEach(child => child.render());

    // Run through queued method calls
    while (this.$ticks.length > 0) {
      this.$ticks.pop()();
    }

    // Post callback
    this.rendered?.();
  }


  // Life cycle

  $connect() {
    // Call first lifecycle method
    this.beforeConnected?.();
    // First render pass
    this.render();
    // Call first lifecycle method
    this.connected?.();
  }

  unmount() {
    // Before callback
    this.beforeUnmounted?.();

    // Unmount all children (recursively)
    this.$children.forEach(c => c.unmount());

    // Remove from parent's children
    if (this.$parent != null)
      this.$parent.$children = this.$parent.$children.filter(c => c !== this);

    // Remove from global component list
    Vivere.components = Vivere.components.filter(c => c !== this);

    // Remove from DOM
    this.$element.parentNode.removeChild(this.$element);

    // Final callback
    this.unmounted?.();
  }
};
