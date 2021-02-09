import DisplayDirective from './display';
export default class SrcDirective extends DisplayDirective {
    static id: string;
    element: HTMLImageElement;
    parse(): void;
    evaluateValue(value: unknown): void;
}
