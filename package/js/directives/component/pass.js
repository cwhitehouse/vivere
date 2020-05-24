import Directive from '../directive';
import VivereError from '../../error';
let PassDirective = /** @class */ (() => {
    class PassDirective extends Directive {
        // Parsing
        parse() {
            const { component, expression, key } = this;
            const parent = component.$parent;
            if (parent == null)
                throw new VivereError('Cannot pass properties to a parentless component');
            let readKey;
            if (expression != null && expression.length > 0)
                readKey = expression;
            else
                readKey = key;
            const reactive = parent.$reactives[readKey];
            reactive.registerHook(this, () => component.$react(key));
            component.$pass(key, reactive);
        }
    }
    PassDirective.id = 'v-pass';
    PassDirective.forComponent = true;
    return PassDirective;
})();
export default PassDirective;
