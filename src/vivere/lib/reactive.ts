import { Component } from "../component";
import { Computed } from "./computed";

export class Reactive {
  value: any;
  hooks: Array<Function>;

  constructor(value: any, hooks: Array<Function>) {
    // Recursively setup reactivity
    if (value != null && typeof value === 'object')
      value.forEach((k: string, v: any) => Reactive.set(value, k, v));

    this.value = value;
    this.hooks = hooks;
  }


  // Accessing the value, and tracking updates

  get(): any {
    const watcher: Computed<any> = Computed.context;
    if (watcher != null)
      this.hooks.push(() => watcher.dirty());

    return this.value;
  }


  // Assigning values, and reacting

  set(value: any) {
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.hooks.forEach((hook) => {
        hook(oldValue, value);
      });
    }
  }


  // Class level helpers

  static set(host: object, key: string, value: any, hook?: Function) {
    // Ensure $reactives exists
    if (host.$reactives == null) host.$reactives = {};

    // Check if we've already set up reactivity
    // for this property and component
    if (host.$reactives[key] == null) {
      // Set up this property to use
      // a reactive value under the hood
      host.$reactives[key] = new Reactive(value, hook ? [hook] : []);
      Object.defineProperty(host, key, {
        get() { return host.$reactives[key]?.get(); },
        set(newValue) { host.$reactives[key].set(newValue) },
      });
    } else {
      // Property is already reactive,
      // we can just assign to it
      host[key] = value;
    }
  }

  static pass(component: Component, key: string, reactive: Reactive) {
    const passed = component.$passed[key];
    passed.$reactive = reactive;

    // Pass off a Reactive property managed
    // by a different object
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
      set() { throw "Cannot update passed values from a child"; },
    });
    component[key];
  }
};
