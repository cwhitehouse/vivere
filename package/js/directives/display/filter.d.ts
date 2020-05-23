import DisplayDirective from './display';
import { NodeHost } from '../../lib/dom';
export default class FilterDirective extends DisplayDirective {
    static id: string;
    children: NodeHost[];
    parse(): void;
    evaluateValue(value: unknown): void;
    dehydrate(): void;
}
