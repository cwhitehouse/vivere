import ComponentContext from '../components/component-context';
import Watcher from './watcher';
import Registry from './registry';
import ReactiveArray from './array';
import ReactiveObject from './object';
import VivereError from '../errors/error';
import Coordinator from './coordinator';
import Reactable from './reactable';

export default class Reactive implements Reactable {
  $reactives: { [key: string]: Reactive };
  value: unknown;
  registry: Registry<object, (newValue: unknown, oldValue: unknown) => void>;

  constructor(value: unknown) {
    this.registry = new Registry();
    this.updateValue(value);
  }


  // Accessing the value, and tracking updates

  getValue(): unknown {
    return this.value;
  }

  get(): unknown {
    const watcher = Watcher.current;
    if (watcher != null) {
      const { context, callback } = watcher;
      this.registerHook(context, callback);
    }

    return this.getValue();
  }


  // Assigning values, and reacting

  set(value: unknown): void {
    const oldValue = this.value;

    // Deal with undefined/null confusion
    if (value == null && oldValue == null)
      return;

    // Don't bother reporting if nothing changed
    if (value !== this.value) {
      Coordinator.chanReactionStarted();
      this.updateValue(value);
      this.$report(value, oldValue);
    }
  }

  updateValue(value: unknown): void {
    this.value = this.reactiveValue(value);
  }

  reactiveValue(value: unknown): unknown {
    if (value == null)
      return null;

    if (value instanceof Array)
      return new ReactiveArray(value, this);

    if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => Reactive.set(value, k, v));
      return new ReactiveObject(value);
    }

    return value;
  }


  // Reporting

  registerHook(object: object, hook: (newValue: unknown, oldValue: unknown) => void): void {
    this.registry.register(object, hook);
  }

  report(newValue: unknown, oldValue: unknown): void {
    Coordinator.chanReactionStarted();
    this.$report(newValue, oldValue);
  }

  $report(newValue: unknown, oldValue: unknown): void {
    this.registry.forEach((entity, hook) => {
      if (entity instanceof ComponentContext)
        Coordinator.trackComponent(entity, hook, newValue, oldValue);
      else
        hook(newValue, oldValue);
    });

    Coordinator.chainReactionEnded();
  }


  // Helper method for automatically making a property reactive

  static set(host: unknown, key: string, value: unknown, obj?: object): Reactive {
    const $host = host as Reactable;

    // Ensure $reactives property exists
    if ($host.$reactives == null)
      $host.$reactives = {};

    // Check if we've already set up reactivity
    // for this property and component
    let reactive: Reactive = $host.$reactives[key];
    if (reactive == null) {
      // Initialize a Reactive object
      reactive = new Reactive(value);

      // Track the reactive object on the host
      $host.$reactives[key] = reactive;

      // Override property definitions
      Object.defineProperty((obj || $host), key, {
        configurable: true,
        get() { return $host.$reactives[key] && $host.$reactives[key].get(); },
        set(newValue) { $host.$reactives[key].set(newValue); },
      });
    } else
      // Simple assignment is sufficient
      (obj || host)[key] = value;

    return reactive;
  }


  // Helper method for tracking passed properties

  static pass(context: ComponentContext, key: string, reactive: Reactive): void {
    // Track the Reactive on the Passed info
    const passed = context.passed[key];
    if (passed == null)
      throw new VivereError(`Value passed to component for unknown key ${key}`);

    passed.$reactive = reactive;

    // Pass down Reactive property
    Object.defineProperty(context.component, key, {
      configurable: true,
      get() {
        if (passed == null)
          throw new VivereError(`Value passed to component for unknown key ${key}`);

        let value = reactive.get();
        if (value == null) {
          if (passed.required)
            throw new VivereError(`${key} is required to be passed`);

          value = passed.default;
        }

        return value;
      },
      set() {
        throw new VivereError('Cannot update passed values from a child');
      },
    });

    // Invoke once to ensure Watcher is initialized
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    context.component[key];
  }


  // Better JSON rendering

  toJSON(): string {
    return JSON.stringify(this.value);
  }
}
