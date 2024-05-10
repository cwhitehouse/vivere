import VivereComponent from '../components/vivere-component';
import ReactiveHost from '../reactivity/reactive-host';
import Utility from '../lib/utility';
import VivereError from '../errors/error';

interface HookConstructor<U, T> {
  new (component: VivereComponent, args: U): VivereHook<U, T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class VivereHook<U, T> extends ReactiveHost {
  $component: VivereComponent;

  constructor(component: VivereComponent) {
    super();
    this.$component = component;
  }

  attach?(): T;
  connected?(): void;
  rendered?(): void;
  beforeDehydrated?(): void;
  beforeDestroyed?(): void;

  $makeReactive(key: string): void {
    const descriptor = Object.getOwnPropertyDescriptor(this, key);
    if (descriptor == null)
      throw new VivereError('Trying to make a non-existant property reactive');

    const { get: getter, set: setter, value } = descriptor;
    const reactive = this.$set(key, value, getter, setter);

    reactive.listeners.register(this, (oldValue: unknown) => {
      const newValue = this[key];

      // All null like values we'll consider the same
      if (newValue == null && oldValue == null)
        return;

      // Check if our property actually changed
      if (newValue !== oldValue)
        // Invoke any listeners
        this[`on${Utility.pascalCase(key)}Changed`]?.(newValue, oldValue);
    });
  }
}

export { HookConstructor, VivereHook };
