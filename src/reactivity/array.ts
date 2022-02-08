import ReactiveObject from './object';
import Reactive from './reactive';

export default class ReactiveArray {
  static makeArrayReactive(array: unknown[]): void {
    for (let i = 0; i < array.length; i += 1) {
      // Fetch the relevant value
      const value = array[i];
      ReactiveObject.makeValueReactive(array, i, value);
    }
  }

  constructor(array: unknown[]) {
    ReactiveArray.makeArrayReactive(array);

    const listeners: Set<Reactive> = new Set();

    return new Proxy(array, {
      get(target, p): unknown {
        // Fetch the value from the Reactive
        const value = target[p];

        if (value instanceof Reactive)
          return value.get();

        if (p === '$reactives')
          return [...target];

        switch (p) {
          case 'push':
          case 'unshift':
            return (...args: unknown[]): unknown => {
              const oldValue = [...target];
              // Any new objects must be reactive
              const reactiveArgs = args.map((a) => {
                if (a instanceof Reactive)
                  return a;
                return new Reactive(target, a, null);
              });
              const result = value.apply(target, reactiveArgs);
              listeners.forEach((l) => l.report(target, oldValue));
              return result;
            };
          case 'pop':
          case 'shift':
          case 'reverse':
          case 'sort':
            // Mutating methods should force a report
            return (...args: unknown[]): unknown => {
              const oldValue = [...target];
              const result = value.apply(target, args);
              listeners.forEach((l) => l.report(target, oldValue));
              return result;
            };
          case 'splice':
            return (start: number, deleteCount?: number, ...items: unknown[]): unknown => {
              const oldValue = [...target];
              const reactiveItems = items?.map((i) => {
                if (i instanceof Reactive)
                  return i;
                return new Reactive(target, i, null);
              });
              const result = value.apply(target, [start, deleteCount, ...reactiveItems]);
              listeners.forEach((l) => l.report(target, oldValue));
              return result;
            };
          case '$$registerListener':
            return (listener: Reactive) => {
              listeners.add(listener);
            };
          case '$$reactiveArray':
            return true;
          case '$$reactiveProxy':
            return true;
          default:
            // Anything else can pass through as normal
            return value;
        }

        return value;
      },

      set(target, p, value) {
        return ReactiveObject.setReactiveValue(target, p, value);
      },
    });
  }
}
