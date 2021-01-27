import Reactive from './reactive';
export default class ReactiveObject {
    constructor(object) {
        return new Proxy(object, {
            get(target, propKey) {
                let temp;
                const value = target[propKey];
                switch (propKey) {
                    case 'toJSON':
                        // toJSON should ignore $reactives
                        temp = { ...target };
                        delete temp.$reactives;
                        return () => temp;
                    default:
                        if (value.bind != null)
                            // Functions need to be bound to the right target
                            return value.bind(target);
                        // Anything else can pass through as normal
                        return value;
                }
            },
            set(target, p, value) {
                Reactive.set(target, p, value);
                return true;
            },
        });
    }
}
