export default class Registry<T, V> {
    $array: Array<T>;
    $map: {
        prop?: V;
    };
    constructor();
    register(key: T, value: V): void;
    deregister(key: T): void;
    get(key: T): void;
    forEach(func: (key: T, value: V) => void): void;
}
