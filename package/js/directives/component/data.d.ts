import Directive from '../directive';
export default class DataDirective extends Directive {
    static id: string;
    static forComponent: boolean;
    parse(): void;
}
