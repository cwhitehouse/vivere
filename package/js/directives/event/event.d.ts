import Directive from '../directive';
export default class EventDirective extends Directive {
    event: 'click' | 'keydown' | 'mouseenter' | 'mouseleave' | 'mouseover';
    binding: (event: Event) => boolean;
    parse(): void;
    destroy(): void;
    execute(e: Event): void;
}
