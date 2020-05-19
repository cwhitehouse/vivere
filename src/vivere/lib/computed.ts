import { Component } from "../component";

export class Computed<T> {
  static context?: Computed<any>;

  $dirty:     Boolean     = false;
  evaluator:  Function;
  value:      T;

  constructor(context: Component, evaluator: Function) {
    this.evaluator = evaluator;
    this.updateValue(context);
  }


  // Value computation

  dirty() {
    this.$dirty = true;
  }

  updateValue(context: Component) {
    this.constructor.context = this;

    this.value = this.evaluator.call(context);
    this.$dirty = false;

    this.constructor.context = null;
  }

  getValue(context: Component) {
    if (this.$dirty)
      this.updateValue(context);

    return this.value;
  }


  // Class level helpers

  static set(component: Component, key: string, evaluator: Function) {
    // Check if we've already set up computedness
    // for this property and object
    if (component.$computeds[key] == null) {
      // Set up this property to use
      // a reactive value under the hood
      component.$computeds[key] = new Computed(component, evaluator);
      Object.defineProperty(component, key, {
        get() { return component.$computeds[key].getValue(component); },
        set() { throw `Cannot assign to computed property ${key}`; },
      });
    } else {
      // Property is already computed
      throw `Cannot assign to computed property ${key}`;
    }
  }
}
