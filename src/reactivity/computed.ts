import Reactive from './reactive';
import ComponentContext from '../components/component-context';
import Watcher from './watcher';
import Component from '../components/component';
import ComponentError from '../errors/component-error';

export default class Computed extends Reactive {
  $computed = false;
  object: object;
  evaluator: () => unknown;

  constructor(object: object, evaluator: () => unknown) {
    super(null);

    this.object = object;
    this.evaluator = evaluator;
  }

  // Value management

  dirty(): void {
    this.computeValue();
  }

  computeValue(): void {
    const callback = (): void => { this.dirty(); };
    Watcher.watch(this, callback, () => {
      const newValue = this.evaluator.call(this.object);
      this.set(newValue);
      this.$computed = true;
    });
  }

  getValue(): unknown {
    if (!this.$computed)
      this.computeValue();

    return this.value;
  }

  set(value: unknown): void {
    super.set(value, false);
  }

  // Static helpers

  static set(context: ComponentContext, key: string, evaluator: () => unknown, component: Component): Computed {
    let computed: Computed;

    // Check if we've already set up computedness
    // for this property and object
    if (context.computeds[key] == null) {
      // Set up this property to use
      // a reactive value under the hood
      computed = new Computed(component, evaluator);
      context.computeds[key] = computed;

      Object.defineProperty(component, key, {
        configurable: true,
        get() { return context.computeds[key].get(); },
        set() { throw new ComponentError(`Cannot assign to computed property ${key}`, component); },
      });
    } else
      // Property is already computed
      throw new ComponentError(`Cannot assign to computed property ${key}`, component);

    return computed;
  }
}
