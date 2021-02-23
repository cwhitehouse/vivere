import Directive from './directive';
export default class EventDirective extends Directive {
    static id: string;
    binding: (event: Event) => boolean;
    clickOutsideBinding: (event: Event) => void;
    parse(): void;
    destroy(): void;
    handleClickOutside(e: Event): void;
    execute(e: Event): boolean;
    executeEvent(e: Event): void;
    matchesKeycode(keyCode: string | number, keyEvent: string): boolean;
}
