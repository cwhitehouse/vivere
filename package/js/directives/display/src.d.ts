import DisplayDirective from './display';
export default class HrefDirective extends DisplayDirective {
    static id: string;
    element: HTMLImageElement;
    parse(): void;
    evaluateValue(value: unknown): void;
}
