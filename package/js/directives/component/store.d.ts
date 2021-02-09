import Directive from '../directive';
export default class StoreDirective extends Directive {
    static id: string;
    static forComponent: boolean;
    static shouldRehydrate: boolean;
    parse(): void;
}
