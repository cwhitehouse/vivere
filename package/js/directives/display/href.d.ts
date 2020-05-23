import DisplayDirective from './display';
export default class HrefDirective extends DisplayDirective {
    static id: string;
    element: HTMLAnchorElement;
    event: string;
    binding: (event: Event) => boolean;
    parse(): void;
    evaluateValue(value: unknown): void;
}
