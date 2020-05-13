import Attributes from '../lib/attributes.js';
import Directives from './directives.js';
import Vivere from './vivere.js';
import { Reactive } from './reactive.js';

export class Component {
  // ----------------------------------
  // CONSTRUCTOR
  // ----------------------------------

  constructor(element, name, parent) {
    // Load the component definition
    const normalizedName = Attributes.normalize(name)
    const definition = Vivere.definitions[normalizedName];
    if (definition == null) throw `Tried to instantiate unknown component ${normalizedName}`;

    // Initialize the component data
    Object.assign(this, {
      $bindings: {},
      $children: [],
      $element: element,
      $livingElements: {},
      $name: normalizedName,
      $parent: parent,
      $reactives: {},
      ...definition.callbacks,
      ...definition.methods,
    });

    if (definition.data != null) {
      definition.data.forEach((key,value) => {
        this.$set(key, value);
      });
    }

    // Attach the component to the DOM
    element.$vivere = this;

    // Track this component as a child of its parent
    parent?.$children.push(this);
  }


  // ----------------------------------
  // INTERNAL METHODS
  // ----------------------------------

  $set(name, value) {
    // Check if we've already set this proeprty
    if (this[name] == null) {
      // Sets up a reactive hook for a given value
      this.$reactives[name] = new Reactive(value, (was, is) => { this.$react(name, was, is); });
      Object.defineProperty(this, name, {
        get() { return this.$reactives[name]?.value; },
        set(newValue) { this.$reactives[name].set(newValue) },
      });
    } else {
      this[name] = value;
    }
  }

  $pass(name, reactive) {
    // Handles handing off a passed value from a parent
    this.$reactives[name] = reactive;
    Object.defineProperty(this, name, {
      get() { return this.$reactives[name]?.value; },
      set(_) { throw "Cannot update passed values from the child"; },
    });
  }

  $react(name, was, is) {
    // Watches for changes to any reactive properties
    //TODO: Do something about values changing
  }

  $connected() {
    // Call first lifecycle method
    this.beforeConnected?.();
    // First render pass
    this.render();
    // Call first lifecycle method
    this.connected?.();
  }

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
    this[method]?.(args);
    this.render();
  }

  $handleEvent(e, value) {
    // Generic event handler
    this[value]?.(e);
    // Always render when
    // events are triggered
    this.render();
  }


  // ----------------------------------
  // RENDERING
  // ----------------------------------

  render() {
    // Before callback
    this.beforeRendered?.();

    // Find display directives
    Directives.Display.forEach((directive) => {
      this.$livingElements[directive]?.forEach(({ element, value }) => {
        switch (directive) {
          case 'v-if':
            let result;
            if (typeof this[value] === 'function') result = this[value]();
            else result = this[value];

            const method = result ? 'remove' : 'add';
            element.classList[method]('hidden');
            break;
          case 'v-text':
            const text = this[value]?.();
            element.textContent = text;
            break;
          case 'v-class':
            JSON.parse(value).forEach((klass, val) => {
              let result;
              if (typeof this[val] === 'function') result = this[val]();
              else result = this[val];

              const method = result ? 'add' : 'remove';
              element.classList[method](klass);
            });

            break;
        };
    });
    });
    this.$children.forEach(child => child.render());

    // Post callback
    this.rendered?.();
  }

  unmount() {
    // Before callback
    this.beforeUnmounted?.();

    // Unmount all children (recursively)
    this.$children.forEach((child) => {
      child.unmount();
    });

    // Remove from parent's children
    if (this.$parent != null) {
      this.$parent.$children = this.$parent.$children.filter(c => c !== this);
    }

    // Remove from global component list
    Vivere.components = Vivere.components.filter(c => c !== this);

    // Remove from DOM
    this.$element.parentNode.removeChild(this.$element);

    // Final callback
    this.unmounted?.();
  }
};
