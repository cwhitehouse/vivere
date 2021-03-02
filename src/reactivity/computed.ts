import Reactive from './reactive';
import ComponentContext from '../components/component-context';
import Watcher from './watcher';
import Component from '../components/component';
import ComponentError from '../errors/component-error';

export default class Computed extends Reactive {
  $computed = false;
  context: ComponentContext;
  evaluator: () => unknown;

  constructor(context: ComponentContext, evaluator: () => unknown) {
    super(null);

    this.context = context;
    this.evaluator = evaluator;
  }


  // Component access

  get component(): Component {
    return this.context.component;
  }


  // Value management

  dirty(): void {
    this.computeValue();
  }

  computeValue(): void {
    const callback = (): void => { this.dirty(); };
    Watcher.watch(this, callback, () => {
      const newValue = this.evaluator.call(this.component);
      this.set(newValue);
      this.$computed = true;
    });
  }

  getValue(): unknown {
    if (!this.$computed)
      this.computeValue();

    return this.value;
  }


  // Static helpers

  static set(context: ComponentContext, key: string, evaluator: () => unknown, component: Component): Computed {
    let computed: Computed;

    // Check if we've already set up computedness
    // for this property and object
    if (context.computeds[key] == null) {
      // Set up this property to use
      // a reactive value under the hood
      computed = new Computed(context, evaluator);
      context.computeds[key] = computed;

      Object.defineProperty(component, key, {
        configurable: true,
        get() { return context.computeds[key].get(); },
        set() { throw new ComponentError(`Cannot assign to computed property ${key}`, context.component); },
      });
    } else
      // Property is already computed
      throw new ComponentError(`Cannot assign to computed property ${key}`, context.component);


    return computed;
  }
}
