import Reactive from './reactive';

export default class ReactiveObject {
  // eslint-disable-next-line @typescript-eslint/ban-types
  static makeValueReactive(listeners: Set<Reactive>, object: object, key: string | number | symbol, value: unknown): void {
    let reactive: Reactive = null;
    if (value instanceof Reactive)
      reactive = value;
    else {
      reactive = new Reactive(object, value, null);
      object[key] = reactive;
    }

    if (listeners != null)
      // We want any Reactives referencing this ReactiveObject or ReactiveArray to
      // be notified if any of its children change (this is necessary for repoerting
      // changes to objects nested within objects or arrays)
      reactive.registerHook(object, (oldValue: unknown) => {
        listeners.forEach((l) => l.report({ ...object, key: oldValue }));
      });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static setReactiveValue(listeners: Set<Reactive>, target: object, p: string | symbol, value: unknown): boolean {
    const currentValue = target[p];

    // Update value while mainting reactivity
    if (currentValue instanceof Reactive)
      currentValue.set(value, true);
    else if (value instanceof Reactive)
      target[p] = value;
    else
      this.makeValueReactive(listeners, target, p, value);

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(object: object) {
    // Keep track of $$listeners we need to report to
    const listeners: Set<Reactive> = new Set();

    // Make the object reactive
    Object.entries(object).forEach(([key, value]) => {
      ReactiveObject.makeValueReactive(listeners, object, key, value);
    });

    // Create our proxy
    return new Proxy(object, {
      get(target, p): unknown {
        const value = target[p];

        if (value instanceof Reactive)
          return value.get();

        if (p === '$reactives')
          return { ...target };

        switch (p) {
          case '$$registerListener':
            return (listener: Reactive) => {
              listeners.add(listener);
            };
          case '$$report':
            return (oldValue: unknown) => {
              listeners.forEach((l) => l.report(oldValue));
            };
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

      set(target, p, value) {
        return ReactiveObject.setReactiveValue(listeners, target, p, value);
      },
    });
  }
}
