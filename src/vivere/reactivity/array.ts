import { Reactive } from "./reactive";

export class ReactiveArray {
  constructor(array: any[], host: Reactive) {
    return new Proxy(array, {
      get(target, propKey, receiver): any {
        const value = target[propKey];
        switch (propKey) {
          case 'push':
          case 'splice':
          case 'unshift':
            // Mutating methods should force a report
            return (...args: any[]) => {
              const result = value.apply(target, args);
              host.report();
              return result;
            }
          default:
            // Anything else can pass through as normal
            return value;
        };
      },
    });
  }
}
