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

  $sync(e, element, syncValue) {
    const parts = syncValue.split(".");
    let node = this;
    parts.slice(0,- 1).forEach((part) => {
      node = node[part];
    });

    let newValue;
    if (element.type === 'checkbox') newValue = element.checked;
    else newValue = element.value;
    node[parts[parts.length - 1]] = newValue;

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
            let ifValue = value;
            let invertIf = false;
            if (ifValue.startsWith('!')) {
              ifValue = ifValue.slice(1);
              invertIf = true;
            }

            let ifNode = this;
            ifValue.split('.').forEach((part) => {
              if (typeof ifNode[part] === 'function') ifNode = ifNode[part]();
              else ifNode = ifNode[part];
            });
            if (invertIf) ifNode = !ifNode;

            const ifMethod = ifNode ? 'remove' : 'add';
            element.classList[ifMethod]('hidden');
            break;
          case 'v-disabled':
            let disabledValue = value;
            let invertDisabled = false;
            if (disabledValue.startsWith('!')) {
              disabledValue = booleanValue.slice(1);
              invertDisabled = true;
            }

            let disabledNode = this;
            disabledValue.split('.').forEach((part) => {
              if (typeof disabledNode[part] === 'function') disabledNode = disabledNode[part]();
              else disabledNode = disabledNode[part];
            });
            if (invertDisabled) disabledNode = !disabledNode;

            element.disabled = disabledNode;
            break;
          case 'v-text':
            let textNode = this;
            value.split('.').forEach((part) => {
              if (typeof textNode[part] === 'function') textNode = textNode[part]();
              else textNode = textNode[part];
            });
            element.textContent = textNode;
            break;
          case 'v-class':
            JSON.parse(value).forEach((klass, val) => {
              let classNode = this;
              val.split('.').forEach((part) => {
                if (typeof classNode[part] === 'function') classNode = classNode[part]();
                else classNode = classNode[part];
              });

              const classMethod = classNode ? 'add' : 'remove';
              element.classList[classMethod](klass);
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
