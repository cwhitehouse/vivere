import Reactive from './reactive';
import Component from '../components/component';
import Watcher from './watcher';
import VivereError from '../lib/error';

export default class Computed extends Reactive {
  $dirty = false;

  context: Component;

  evaluator: () => unknown;

  constructor(context: Component, evaluator: () => unknown) {
    super(null);

    this.context = context;
    this.evaluator = evaluator;
    this.computeValue();
  }


  // Value management

  computeValue(): void {
    Watcher.assign(this, () => { this.computeValue(); });

    const newValue = this.evaluator.call(this.context);
    this.set(newValue);
    this.$dirty = false;

    Watcher.clear();
  }

  getValue(): unknown {
    if (this.$dirty)
      this.computeValue();

    return this.value;
  }


  // Static helpers

  static set(component: Component, key: string, evaluator: () => unknown): Computed {
    let computed: Computed;

    // Check if we've already set up computedness
    // for this property and object
    if (component.$computeds[key] == null) {
      // Set up this property to use
      // a reactive value under the hood
      computed = new Computed(component, evaluator);
      component.$computeds[key] = computed;

      Object.defineProperty(component, key, {
        get() { return component.$computeds[key].get(); },
        set() { throw new VivereError(`Cannot assign to computed property ${key}`); },
      });
    } else
      // Property is already computed
      throw new VivereError(`Cannot assign to computed property ${key}`);


    return computed;
  }
}
