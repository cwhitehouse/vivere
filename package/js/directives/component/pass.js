import Directive from '../directive';
import VivereError from '../../error';
let PassDirective = /** @class */ (() => {
    class PassDirective extends Directive {
        // Parsing
        parse() {
            const parent = this.component.$parent;
            if (parent == null)
                throw new VivereError('Cannot pass properties to a parentless component');
            let readKey;
            if (this.expression != null)
                readKey = this.expression;
            else
                readKey = this.key;
            const reactive = parent.$reactives[readKey];
            reactive.registerHook(this, () => this.component.$react(this.key));
            this.component.$pass(this.key, reactive);
        }
    }
    PassDirective.id = 'v-pass';
    PassDirective.forComponent = true;
    return PassDirective;
})();
export default PassDirective;
