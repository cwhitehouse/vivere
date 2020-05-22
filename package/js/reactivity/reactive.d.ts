import Component from '../components/component';
import Registry from './registry';
interface Reactable {
    $reactives?: {
        prop?: Reactive;
    };
}
export default class Reactive implements Reactable {
    $reactives: {
        prop: Reactive;
    };
    value: unknown;
    registry: Registry<object, () => void>;
    constructor(value: unknown);
    getValue(): unknown;
    get(): unknown;
    set(value: unknown): void;
    updateValue(value: unknown): void;
    reactiveValue(value: unknown): unknown;
    registerHook(object: object, hook: () => void): void;
    report(): void;
    static set(host: unknown, key: string | number | symbol, value: unknown): Reactive;
    static pass(component: Component, key: string, reactive: Reactive): void;
}
export {};
