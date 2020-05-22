import DisplayDirective from './display';
export default class ShowDirective extends DisplayDirective {
    static id: string;
    evaluateValue(value: unknown): void;
}
