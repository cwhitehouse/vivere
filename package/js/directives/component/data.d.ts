import Directive from '../directive';
export default class DataDirective extends Directive {
    static id: string;
    static forComponent: boolean;
    static shouldRehydrate: boolean;
    parse(): void;
}
