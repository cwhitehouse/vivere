import DisplayDirective from './display';
export default class SyncDirective extends DisplayDirective {
    static id: string;
    element: HTMLInputElement;
    event: string;
    binding: (event: Event) => boolean;
    parse(): void;
    evaluateValue(value: unknown): void;
    destroy(): void;
    value(): string | boolean;
    sync(): void;
}
