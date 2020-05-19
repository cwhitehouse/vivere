import Utility from './lib/utility.js';
import Vivere from './vivere.js';
import { Reactive } from './lib/reactive.js';
import Walk from './lib/walk.js';

export class Component {
  // Constructor

  constructor(element, name, parent) {
    // Load the component definition
    const compName = Utility.pascalCase(name)
    const definition = Vivere.definitions[compName];
    if (definition == null) throw `Tried to instantiate unknown component ${compName}`;

    // Initialize the component data
    Object.assign(this, {
      $bindings: {},
      $children: [],
      $directives: [],
      $element: element,
      $name: compName,
      $parent: parent,
      $reactives: {},
      $refs: {},
      $ticks: [],
      $watchers: { ...definition.watch },
      ...definition.callbacks,
      ...definition.methods,
    });

    if (definition.data != null) {
      definition.data.forEach((key,value) => {
        this.$set(key, value);
      });
    }

    // Attach the component to the DOM
    element.$component = this;

    // Track this component as a child of its parent
    parent?.$children.push(this);
  }


  // Reactivity

  $set(key, value) {
    // Turn on reactivity for properties
    Reactive.set(this, key, value, (was, is) => {
      this.$react(key, was, is);
    });
  }

  $pass(key, reactive) {
    Reactive.pass(this, key, reactive);
  }

  $react(key, was, is) {
    // Watches for changes to any reactive properties
    this.$watchers[key]?.call(this, was, is);
  }


  // Event passing

  $emit(event, args) {
    // Check bindings
    const method = this.$bindings[event];
    if (method != null) {
      // Pass a message to parent
      this.$parent?.[method]?.(args);

      // Parent may need to re-render
      this.$parent?.render();
    }
  }

  $invokeBinding(event, args) {
    const method = this.$bindings[event];
    this[method](args);
    this.render();
  }


   // Append DOM

   $attach(html, ref) {
    const element = this.$refs[ref];
    if (element == null) throw `No reference named ${ref} found`;

    // TODO: Re-evaluate how innerHTML is handled here
     element.innerHTML = `${element.innerHTML}${html}`;
     Walk.children(element, this);
   }


  // Rendering

  $nextRender(func) {
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
