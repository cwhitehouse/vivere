import Reactive from '../reactivity/reactive';
import Directive from '../directives/directive';
import Callbacks from './callbacks';
import { ComponentDefintion } from './definition';
declare global {
    interface Element {
        $component: Component;
    }
}
export default class Component {
    $bindings: object;
    $callbacks: Callbacks;
    $children: Set<Component>;
    $computeds: object;
    $definition: ComponentDefintion;
    $directives: Set<Directive>;
    $dirty: boolean;
    $element: Element;
    $name: string;
    $parent?: Component;
    $passed: object;
    $reactives: {
        prop?: Reactive;
    };
    $refs: object;
    $watchers: object;
    constructor(element: Element, name: string, parent?: Component);
    $set(key: string, value: unknown): void;
    $compute(key: string, evaluator: () => unknown): void;
    $pass(key: string, reactive: Reactive): void;
    $react(key: string, newValue: unknown, oldValue: unknown): void;
    $emit(event: string, arg: unknown): void;
    $invokeBinding(event: string, arg: unknown): void;
    $attach(html: string, ref: string): void;
    $queueRender(directive: Directive): void;
    $nextRender(func: () => void): void;
    forceRender(shallow?: boolean): void;
    $connect(): void;
    $destroy(shallow?: boolean): void;
    $dehydrate(shallow?: boolean): void;
    $dehydrateData(): void;
}
