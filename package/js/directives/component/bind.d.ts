import Directive from '../directive';
export default class BindDirective extends Directive {
    static id: string;
    static forComponent: boolean;
    parse(): void;
}
