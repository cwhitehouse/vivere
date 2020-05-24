import Directive from '../directives/directive';
import Computed from './computed';
export default class Watcher {
    context: Directive | Computed;
    callback: () => void;
    constructor(context: Directive | Computed, callback: () => void);
    static current?: Watcher;
    static watch(context: Directive | Computed, callback: () => void, watch: () => void): void;
}
