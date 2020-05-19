import { Component } from "../component";

export class Computed<T> {
  evaluator: Function;
  dirty: Boolean;
  value: T;

  constructor(evaluator: Function) {
    Object.assign(this, {
      evaluator,
      dirty: false,
    });
    this.assess();
  }

  assess() {
    if (this.dirty) {
      this.value = this.evaluator();
      this.dirty = false;
    }

    return this.value;
  }

  static set(component: Component, key: string, evaluator: Function) {
    // Check if we've already set up computedness
    // for this property and object
    if (component.$computeds[key] == null) {
      // Set up this property to use
      // a reactive value under the hood
      component.$computeds[key] = new Computed(evaluator);
      Object.defineProperty(component, key, {
        get() { return component.$computeds[key].assess(); },
        set() { throw `Cannot assign to computed property ${key}`; },
      });
    } else {
      // Property is already computed
      throw `Cannot assign to computed property ${key}`;
    }
  }
}
