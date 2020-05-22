import DisplayDirective from './display';
import { NodeHost } from '../../lib/dom';
export default class IfDirective extends DisplayDirective implements NodeHost {
    static id: string;
    container: Node;
    current: Node;
    placeholder: Node;
    parse(): void;
    evaluateValue(value: unknown): void;
}
