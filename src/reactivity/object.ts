import Reactive from './reactive';
import ReactiveHost from './reactive-host';

export default class ReactiveObject {
  static mirrorObject(object: { [key: string]: unknown }): ReactiveHost {
    const hostObject = new ReactiveHost();
    Object.entries(object).forEach(([key, value]) => {
      hostObject.$set(key, value);
    });
    return hostObject;
  }

  static proxyGet(target: ReactiveHost, propKey: (string | symbol)): unknown {
    let properties: [string, Reactive][];
    let temp: unknown;

    const value = target[propKey];
    switch (propKey) {
      case 'toJSON':
        temp = {};

        // toJSON should ignore internals, so we'll pull out reactive values
        properties = Object.entries(target.$reactives);
        properties.forEach(([k, v]) => {
          temp[k] = v.get();
        });

        return (): { prop?: unknown } => temp;
      case '$$reactiveObject':
        return true;
      case '$$reactiveProxy':
        return true;
      default:
        if (value && value.bind)
          // Functions need to be bound to the right target
          return value.bind(target);
        // Anything else can pass through as normal
        return value;
    }
  }

  static proxySet(target: ReactiveHost, propKey: (string | symbol), value: unknown): boolean {
    target.$set(propKey.toString(), value);
    return true;
  }

  constructor(object: unknown) {
    const hostObject = ReactiveObject.mirrorObject(object as { [key: string]: unknown });
    return new Proxy(hostObject, {
      get: ReactiveObject.proxyGet,
      set: ReactiveObject.proxySet,
    });
  }
}
