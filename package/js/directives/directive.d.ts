import Component from '../components/component';
export default class Directive {
    static id: string;
    static forComponent: boolean;
    static needsComponent: boolean;
    component?: Component;
    element: Element;
    expression: string;
    key?: string;
    constructor(element: Element, name: string, expression: string, component?: Component);
    parse(): void;
    evaluate(): void;
    destroy(): void;
    id(): string;
    forComponent(): boolean;
    needsComponent(): boolean;
    onComponent(): boolean;
}
