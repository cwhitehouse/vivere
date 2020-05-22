import DisplayDirective from './display';
export default class SortDirective extends DisplayDirective {
    static id: string;
    evaluateValue(value: unknown): void;
    finalPart(expression: string): string;
}
