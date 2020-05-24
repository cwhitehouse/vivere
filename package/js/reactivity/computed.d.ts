import Reactive from './reactive';
import Component from '../components/component';
export default class Computed extends Reactive {
    $dirty: boolean;
    context: Component;
    evaluator: () => unknown;
    constructor(context: Component, evaluator: () => unknown);
    dirty(): void;
    computeValue(): void;
    getValue(): unknown;
    static set(component: Component, key: string, evaluator: () => unknown): Computed;
}
