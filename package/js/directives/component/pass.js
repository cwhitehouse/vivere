import Directive from '../directive';
import VivereError from '../../error';
import Utility from '../../lib/utility';
let PassDirective = /** @class */ (() => {
    class PassDirective extends Directive {
        // Parsing
        parse() {
            const { component, expression } = this;
            const parent = component.$parent;
            const key = Utility.camelCase(this.key);
            if (parent == null)
                throw new VivereError('Cannot pass properties to a parentless component');
            let readKey;
            if (expression != null && expression.length > 0)
                readKey = expression;
            else
                readKey = key;
            const reactive = parent.$reactives[readKey] || parent.$computeds[readKey];
            if (reactive == null)
                throw new VivereError(`Cannot pass property, parent does not define ${readKey}`);
            reactive.registerHook(this, () => component.$react(key));
            component.$pass(key, reactive);
        }
    }
    PassDirective.id = 'v-pass';
    PassDirective.forComponent = true;
    return PassDirective;
})();
export default PassDirective;
