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
            const { element, key, modifiers } = this;
            [key, ...modifiers].forEach((className) => {
                DOM.toggleClass(element, className, !!value);
            });
        }
    }
    ClassDirective.id = 'v-class';
    return ClassDirective;
})();
export default ClassDirective;
