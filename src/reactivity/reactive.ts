import Watcher from './watcher';
import Registry from './registry';
import ReactiveArray from './array';
import ReactiveObject from './object';
import Coordinator from './coordinator';
import VivereComponent from '../components/vivere-component';

export default class Reactive {
  listeners: Registry<unknown, (oldValue: unknown) => void> = new Registry();

  host: unknown;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;

  computed = false;

  getter: () => unknown;

  constructor(host: unknown, value: unknown, getter: () => unknown) {
    this.host = host;

    this.getter = getter;
    if (this.getter == null)
      this.set(value, true);
  }

  // Dirty value

  dirty(): void {
    this.computed = false;

    // We'll report the value has changed, but we won't bother
    // recalculating the value until we need to
    this.report(this.value);
  }

  computeValue(): void {
    const callback = (): void => { this.dirty(); };
    Watcher.watch(this, callback, () => {
      const newValue = this.getter.call(this.host);
      this.set(newValue, false);
      this.computed = true;
    });
  }

  // Accessing the value, and tracking updates

  getValue(): unknown {
    if (this.getter != null && !this.computed)
      this.computeValue();

    return this.value;
  }

  get(): unknown {
    const watcher = Watcher.current;
    if (watcher != null) {
      const { context, callback } = watcher;
      this.registerHook(context, callback);
    }

    if (!this.computed && this.getter != null)
      this.computeValue();

    return this.getValue();
  }

  // Assigning values, and reacting

  set(value: unknown, makeReactive: boolean): void {
    const oldValue = this.value;

    // Deal with undefined/null confusion
    if (value == null && oldValue == null)
      return;

    const oldValueJSON = JSON.stringify(oldValue);
    const newValueJSON = JSON.stringify(value);

    // Don't bother reporting if nothing substantive has changed
    if (oldValueJSON !== newValueJSON) {
      Coordinator.chainReactionStarted();

      if (makeReactive)
        this.updateValue(value);
      else
        this.value = value;

      // If the new value implements $$registerListener (i.e. it is
      // a ReactiveArray), we need to make sure we're listening to changes
      // since multiple Reactives can have a ReactiveArray value (e.g. via
      // a $passed or computed property)
      if (this.value?.$$registerListener)
        this.value.$$registerListener(this);

      this.$report(oldValue);
    }
  }

  updateValue(value: unknown): void {
    this.value = this.reactiveValue(value);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  reactiveValue(value: any): unknown {
    if (value == null)
      return null;

    if (Array.isArray(value)) {
      // If your value is an array, and we've already proxied it,
      // we can just return the value
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (value.$$reactiveArray)
        return value;
      return new ReactiveArray(value);
    }

    if (typeof value === 'object' && !value.$$reactiveObject)
      return new ReactiveObject(value);

    return value;
  }

  // Reporting

  registerHook(object: unknown, hook: (oldValue: unknown) => void): void {
    this.listeners.register(object, hook);
  }

  report(oldValue: unknown): void {
    Coordinator.chainReactionStarted();
    this.$report(oldValue);
  }

  $report(oldValue: unknown): void {
    this.listeners.forEach((entity, hook) => {
      if (entity instanceof VivereComponent)
        Coordinator.trackComponent(entity, hook, oldValue);
      else
        hook(oldValue);
    });

    Coordinator.chainReactionEnded();
  }

  // Better JSON rendering

  toJSON(): string {
    return JSON.stringify(this.value);
  }
}
