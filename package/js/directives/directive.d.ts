import Component from '../components/component';
export default class Directive {
    static id: string;
    static forComponent: boolean;
    static needsComponent: boolean;
    static shouldRehydrate: boolean;
    component?: Component;
    element: Element;
    expression: string;
    key?: string;
    modifiers?: string[];
    constructor(element: Element, name: string, expression: string, component?: Component);
    parse(): void;
    evaluate(): void;
    destroy(): void;
    dehydrate(): void;
    id(): string;
    forComponent(): boolean;
    needsComponent(): boolean;
    onComponent(): boolean;
    shouldRehydrate(): boolean;
}
