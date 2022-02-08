import Reactive from './reactive';

export default class ReactiveObject {
  // eslint-disable-next-line @typescript-eslint/ban-types
  static makeObjectReactive(object: object): void {
    Object.entries(object).forEach(([key, value]) => {
      if (!(value instanceof Reactive))
        // Update the object entry to point to a reactive
        object[key] = new Reactive(object, value, null);
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(object: object) {
    ReactiveObject.makeObjectReactive(object);

    return new Proxy(object, {
      get(target, p): unknown {
        const value = target[p];

        if (value instanceof Reactive)
          return value.get();

        if (p === '$reactives')
          return { ...target };

        switch (p) {
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
      },
      set(target, p, value): boolean {
        // Assign the value as a reactive
        if (value instanceof Reactive)
          target[p] = value;
        else
          target[p] = new Reactive(target, value, null);
        return true;
      },
    });
  }
}
