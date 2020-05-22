import DisplayDirective from './display';
export default class DisabledDirective extends DisplayDirective {
    static id: string;
    element: HTMLInputElement | HTMLButtonElement;
    parse(): void;
    evaluateValue(value: unknown): void;
}
