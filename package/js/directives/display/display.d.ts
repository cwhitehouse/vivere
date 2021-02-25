import Directive from '../directive';
export default class DisplayDirective extends Directive {
    parseExpression(): unknown;
    evaluate(): void;
    evaluateValue(value: unknown): void;
}
