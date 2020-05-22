import Directive from './directive';
let RefDirective = /** @class */ (() => {
    class RefDirective extends Directive {
        // Parsing
        parse() {
            if (this.onComponent()) {
                const parent = this.component.$parent;
                if (parent != null)
                    parent.$refs[this.expression] = this.component;
            }
            this.component.$refs[this.expression] = this.element;
        }
    }
    RefDirective.id = 'v-ref';
    return RefDirective;
})();
export default RefDirective;
