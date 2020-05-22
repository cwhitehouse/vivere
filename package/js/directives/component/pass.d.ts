import Directive from '../directive';
export default class PassDirective extends Directive {
    static id: string;
    static forComponent: boolean;
    parse(): void;
}
