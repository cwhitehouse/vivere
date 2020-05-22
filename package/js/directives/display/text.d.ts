import DisplayDirective from './display';
export default class TextDirective extends DisplayDirective {
    static id: string;
    evaluateValue(value: unknown): void;
}
