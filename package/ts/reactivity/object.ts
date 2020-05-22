import Reactive from './reactive';

export default class ReactiveObject {
  constructor(object: object) {
    return new Proxy(object, {
      set(target, p, value): boolean {
        Reactive.set(target, p, value);
        return true;
      },
    });
  }
}
