import Attributes from '../lib/attributes.js';
import Evaluator from '../lib/evaluator.js';
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

  // Initialization

  $connect() {
    // Call first lifecycle method
    this.beforeConnected?.();
    // First render pass
    this.render();
    // Call first lifecycle method
    this.connected?.();
  }

  // Reactivity management

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
    //TODO: Do something about values changing
  }

  // Component event passing

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

  // DOM event handling

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
            const ifResult = Evaluator.evaluate(this, value);
            const ifMethod = ifResult ? 'remove' : 'add';
            element.classList[ifMethod]('hidden');
            break;
          case 'v-disabled':
            const disabledResult = Evaluator.evaluate(this, value);
            element.disabled = disabledResult;
            break;
          case 'v-text':
            const textResult = Evaluator.evaluate(this, value);
            element.textContent = textResult;
            break;
          case 'v-class':
            JSON.parse(value).forEach((klass, val) => {
              const classResult = Evaluator.evaluate(this, val);
              const classMethod = classResult ? 'add' : 'remove';
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
