import { Reactive } from "./reactive";

export class ReactiveObject {
  constructor(object: object, host: Reactive) {
    return new Proxy(object, {
      set(target, p, value): any {
        Reactive.set(target, p, value);
        return true;
      },
    });
  }
}
