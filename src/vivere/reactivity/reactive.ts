import { Component } from "../components/component";
import { Watcher } from "./watcher";
import { Registry } from "./registry";
import { ReactiveArray } from "./array";
import { ReactiveObject } from "./object";

export class Reactive {
  value:    any;
  registry: Registry<Function>;

  constructor(value: any) {
    this.registry = new Registry();
    this.updateValue(value);
  }


  // Accessing the value, and tracking updates

  getValue(): any {
    return this.value;
  }

  get(): any {
    const watcher: Watcher = Watcher.current;
    if (watcher != null) {
      const { context, callback } = watcher;
      this.registerHook(context, callback);
    }

    return this.getValue();
  }


  // Assigning values, and reacting

  set(value: any) {
    if (value !== this.value) {
      this.updateValue(value);
      this.report();
    }
  }

  updateValue(value: any) {
    this.value = this.reactiveValue(value);
  }

  reactiveValue(value: any) {
    if (value == null)
      return null;

    if (value instanceof Array)
      return new ReactiveArray(value, this);

    if (typeof value === 'object') {
      value.forEach((k: string, v: any) => Reactive.set(value, k, v));
      return new ReactiveObject(value, this);
    }

    return value;
  }


  // Reporting

  registerHook(object: object, hook: Function) {
    this.registry.register(object, hook);
  }

  report() {
    this.registry.forEach((_: any, hook: Function) => hook());
  }


  // Helper method for automatically making a property reactive

  static set(host: object, key: string | number | symbol, value: any): Reactive {
    // Ensure $reactives property exists
    if (host.$reactives == null) host.$reactives = {};

    // Check if we've already set up reactivity
    // for this property and component
    let reactive: Reactive = host.$reactives[key];
    if (reactive == null) {
      // Initialize a Reactive object
      reactive = new Reactive(value);

      // Track the reactive object on the host
      host.$reactives[key] = reactive;

      // Override property definitions
      Object.defineProperty(host, key, {
        get() { return host.$reactives[key]?.get(); },
        set(newValue) { host.$reactives[key].set(newValue) },
      });
    } else {
      // Simple assignment is sufficient
      host[key] = value;
    }

    return reactive;
  }


  // Helper method for tracking passed properties

  static pass(component: Component, key: string, reactive: Reactive) {
    // Track the Reactive on the Passed info
    const passed = component.$passed[key];
    passed.$reactive = reactive;

    // Pass down Reactive property
    Object.defineProperty(component, key, {
      get() {
        if (passed == null)
          throw `Value passed to component for unknown key ${key}`;

        let value = reactive.get();
        if (value == null) {
          if (passed.required) throw `${key} is required to be passed`;
          value = passed.default;
        }

        return value;
      },
      set() {
        throw "Cannot update passed values from a child";
      },
    });
    component[key];
  }
};
