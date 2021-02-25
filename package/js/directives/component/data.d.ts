import Directive from '../directive';
export default class DataDirective extends Directive {
    static id: string;
    static forComponent: boolean;
    camelKey: string;
    parse(): void;
    dehydrate(): void;
}
