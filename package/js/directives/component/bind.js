import Directive from '../directive';
let BindDirective = /** @class */ (() => {
    class BindDirective extends Directive {
        // Parsing
        parse() {
            this.component.$bindings[this.key] = this.expression;
        }
    }
    BindDirective.id = 'v-bind';
    BindDirective.forComponent = true;
    return BindDirective;
})();
export default BindDirective;
