import DisplayDirective from './display';
import VivereError from '../../error';
import Utility from '../../lib/utility';
let ClassDirective = /** @class */ (() => {
    class ClassDirective extends DisplayDirective {
        // Parsing
        parse() {
            if (this.key == null)
                throw new VivereError('Style directive requires a key');
        }
        // Evaluation
        evaluateValue(value) {
            const { element } = this;
            const key = Utility.camelCase(this.key);
            if (element instanceof HTMLElement)
                element.style[key] = value;
        }
    }
    ClassDirective.id = 'v-style';
    return ClassDirective;
})();
export default ClassDirective;
