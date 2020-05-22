import DisplayDirective from './display';
export default class ClassDirective extends DisplayDirective {
    static id: string;
    parse(): void;
    evaluateValue(value: unknown): void;
}
