import ReactiveObject from './object';
import Reactive from './reactive';

export default class ReactiveArray {
  static makeArrayReactive(listeners: Set<Reactive>, array: unknown[]): void {
    for (let i = 0; i < array.length; i += 1) {
      // Fetch the relevant value
      const value = array[i];
      ReactiveObject.makeValueReactive(listeners, array, i, value);
    }
  }

  constructor(array: unknown[]) {
    // Keep track of $$listeners we need to report to
    const listeners: Set<Reactive> = new Set();

    // Make the array reactive
    ReactiveArray.makeArrayReactive(listeners, array);

    // Create our proxy
    return new Proxy(array, {
      get(target, p): unknown {
        // Fetch the value from the Reactive
        const value = target[p];

        if (value instanceof Reactive) return value.get();

        if (p === '$reactives') return [...target];

        switch (p) {
          case 'push':
          case 'unshift':
            return (...args: unknown[]): unknown => {
              // Copy the array to track what it used to look like
              const oldValue = [...target];

              // Apply the transformation to our array
              const result = value.apply(target, args);

              // Loop back through our array and make sure any new items are reactive
              ReactiveArray.makeArrayReactive(listeners, target);

              // Report that the array has changed
              listeners.forEach(l => l.report(oldValue));

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
              listeners.forEach(l => l.report(oldValue));
              return result;
            };
          case 'splice':
            return (
              start: number,
              deleteCount?: number,
              ...items: unknown[]
            ): unknown => {
              // Copy the array to track what it used to look like
              const oldValue = [...target];

              // Apply the transformation to our array
              const result = value.apply(target, [
                start,
                deleteCount,
                ...items,
              ]);

              // Loop back through our array and make sure any new items are reactive
              ReactiveArray.makeArrayReactive(listeners, target);

              // Report that the array has changed
              listeners.forEach(l => l.report(oldValue));

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
        return ReactiveObject.setReactiveValue(listeners, target, p, value);
      },
    });
  }
}
