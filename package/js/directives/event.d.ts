import Directive from './directive';
export default class EventDirective extends Directive {
    static id: string;
    binding: (event: Event) => boolean;
    parse(): void;
    destroy(): void;
    execute(e: Event): void;
    matchesKeycode(keyCode: string | number, keyEvent: string): boolean;
}
