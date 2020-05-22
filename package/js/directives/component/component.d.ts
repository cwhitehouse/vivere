import Directive from '../directive';
export default class ComponentDirective extends Directive {
    static id: string;
    static needsComponent: boolean;
    parse(): void;
}
