import Properties from '../lib/properties';
import Computed from './computed';
import Reactive from './reactive';

export default class ReactiveObject2 {
  constructor(object: object, handler?: (key: string, descriptor: PropertyDescriptor) => boolean) {
    // Parse all properties
    // Set up reactives
    Properties.parse(object, (key, descriptor) => {
      if (!!handler && handler(key, descriptor))
        return;

      const { get, value } = descriptor;
      if (get != null) {
        const computed = new Computed(object, get);
        Object.defineProperty(object, key, {
          get() { return computed.get(); },
        });
      } else if (typeof value !== 'function')
        object[key] = new Reactive(value);
      else
        object[key] = value;
    });

    return new Proxy(object, {
      // We override the getter to automatically parse
      // any reactive values we've stored
      get(target, p, receiver): any {
        const value = target[p];
        if (value instanceof Reactive)
          return value.get();

        if (value && value.bind)
          // Functions need to be bound to the right target
          return value.bind(target);

        return Reflect.get(target, p, receiver);
      },


      // We override our setter to automatically
      // make new properties Reactive, and update
      // any existing Reactive ovbjects
      set(target, p, value, receiver): boolean {
        if (!Object.prototype.hasOwnProperty.call(target, p)) {
          target[p] = new Reactive(value);
          return true;
        }

        const currentValue = target[p];
        if (currentValue instanceof Reactive) {
          currentValue.set(value);
          return true;
        }

        return Reflect.set(target, p, value, receiver);
      },
    });
  }
}
