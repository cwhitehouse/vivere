import Reactive from './reactive';
import Computed from './computed';

export default {
  reactivate(object: object, key: string, descriptor: PropertyDescriptor): void {
    const { get, value } = descriptor;

    if (get != null) {
      const computed = new Computed(object, get);
      Object.defineProperty(object, key, {
        get() { console.log(`getting computed property ${key}`); return computed.get(); },
      });
    } else if (typeof value !== 'function')
      object[key] = new Reactive(value);
    else
      object[key] = value;
  },
};
