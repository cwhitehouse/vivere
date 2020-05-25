import DisplayDirective from './display';
import VivereError from '../../error';
import DOM from '../../lib/dom';
let ClassDirective = /** @class */ (() => {
    class ClassDirective extends DisplayDirective {
        // Parsing
        parse() {
            if (this.key == null)
                throw new VivereError('Class directive requires a key');
        }
        // Evaluation
        evaluateValue(value) {
            const { element, key } = this;
            DOM.toggleClass(element, key, !!value);
        }
    }
    ClassDirective.id = 'v-class';
    return ClassDirective;
})();
export default ClassDirective;
