import Reactive from './reactive';
export default class ReactiveObject {
    constructor(object) {
        return new Proxy(object, {
            set(target, p, value) {
                Reactive.set(target, p, value);
                return true;
            },
        });
    }
}
