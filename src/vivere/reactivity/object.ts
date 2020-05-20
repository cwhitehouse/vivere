import { Reactive, Reactable } from "./reactive";

export class ReactiveObject {
  constructor(object: Reactable, host: Reactive) {
    return new Proxy(object, {
      set(target, p, value): any {
        Reactive.set(target, p, value);
        return true;
      },
    });
  }
}
