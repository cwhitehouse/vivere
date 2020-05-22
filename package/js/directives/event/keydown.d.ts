import EventDirective from './event';
export default class KeydownDirective extends EventDirective {
    static id: string;
    execute(e: KeyboardEvent): void;
    matchesKeycode(keyCode: string | number): boolean;
}
