import Reactive from './reactive';

export default class ReactiveArray {
  static makeArrayReactive(array: unknown[]): void {
    for (let i = 0; i < array.length; i += 1) {
      // Fetch the relevant entry
      const entry = array[i];

      if (!(entry instanceof Reactive))
        // Update the array entry to point to a reactive
        array[i] = new Reactive(array, entry, null);
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
          default:
            // Anything else can pass through as normal
            return value;
        }

        return value;
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
