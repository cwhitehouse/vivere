import Directive from '../directives/directive';
import Computed from './computed';
export default class Watcher {
    context: Directive | Computed;
    callback: () => void;
    constructor(context: Directive | Computed, callback: () => void);
    static current?: Watcher;
    static assign(context: Directive | Computed, callback: () => void): void;
    static clear(): void;
}
