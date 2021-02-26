import Reactive from './reactive';

export default class ReactiveArray {
  constructor(array: unknown[], host: Reactive) {
    return new Proxy(array, {
      get(target, propKey): unknown {
        const value = target[propKey];
        switch (propKey) {
          case 'push':
          case 'splice':
          case 'unshift':
            // Mutating methods should force a report
            return (...args: unknown[]): unknown => {
              const oldValue = [...target];
              const result = value.apply(target, args);
              host.report(target, oldValue);
              return result;
            };
          default:
            // Anything else can pass through as normal
            return value;
        }
      },
    });
  }
}
