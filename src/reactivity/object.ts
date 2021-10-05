import ReactiveHost from './reactive-host';

export default class ReactiveObject {
  constructor(object: unknown) {
    const hostObject = new ReactiveHost();
    Object.entries(object).forEach(([key, value]) => {
      hostObject.$set(key, value);
    });

    return new Proxy(hostObject, {
      get(target, propKey): unknown {
        let properties;
        let temp;

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
          default:
            if (value && value.bind)
              // Functions need to be bound to the right target
              return value.bind(target);
            // Anything else can pass through as normal
            return value;
        }
      },
      set(target, p, value): boolean {
        target.$set(p.toString(), value);
        return true;
      },
    });
  }
}
