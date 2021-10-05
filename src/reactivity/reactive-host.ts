import VivereError from '../errors/error';
import ReactiveHostInterface from './host-interface';
import Reactive from './reactive';

export default class ReactiveHost implements ReactiveHostInterface {
  $reactives: { [key: string]: Reactive } = {};

  $set(key: string, value: unknown, getter: () => unknown = null, setter: (value: unknown) => void = null): Reactive {
    if (typeof value === 'function' || key.startsWith('$') || key.startsWith('#'))
      return null;

    // Check if we've already set up reactivity
    // for this property and component
    let reactive: Reactive = this.$reactives[key];
    if (reactive == null) {
      // Initialize a Reactive object
      reactive = new Reactive(this, value, getter);

      // Track the reactive object on the host
      this.$reactives[key] = reactive;

      // Override property definitions
      Object.defineProperty(this, key, {
        configurable: true,
        get() {
          // Return the value stored in the reactive
          return reactive.get();
        },

        set(newValue) {
          if (setter != null)
            setter.bind(this)(newValue);
          else if (getter != null)
            throw new VivereError(`Cannot assign to computed property ${key}`);
          else
            reactive.set(newValue, true);
        },
      });
    } else
      // Simple assignment is sufficient
      this[key] = value;

    return reactive;
  }

  static set(host: unknown, key: string, value: unknown): Reactive {
    const $host = host as ReactiveHost;
    return $host.$set(key, value, null);
  }
}
