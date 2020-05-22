export default class ReactiveArray {
    constructor(array, host) {
        return new Proxy(array, {
            get(target, propKey) {
                const value = target[propKey];
                switch (propKey) {
                    case 'push':
                    case 'splice':
                    case 'unshift':
                        // Mutating methods should force a report
                        return (...args) => {
                            const result = value.apply(target, args);
                            host.report();
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
