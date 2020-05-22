import EventDirective from './event';
let KeydownDirective = /** @class */ (() => {
    class KeydownDirective extends EventDirective {
        // Execution
        execute(e) {
            // Scope to a particular keycode if
            // a key parameter was provided
            if (this.key != null && !this.matchesKeycode(e.key || e.keyCode))
                return;
            super.execute(e);
        }
        // Key matching
        matchesKeycode(keyCode) {
            switch (this.key) {
                case 'enter':
                    return keyCode === 'Enter'
                        || keyCode === 13;
                case 'escape':
                    return keyCode === 'Escape'
                        || keyCode === 27;
                default:
            }
            if (typeof keyCode === 'string')
                return this.key === keyCode.toLowerCase();
            return this.key === keyCode.toString();
        }
    }
    KeydownDirective.id = 'v-keydown';
    return KeydownDirective;
})();
export default KeydownDirective;
