import DisplayDirective from './display';
import VivereError from '../../error';
let ClassDirective = /** @class */ (() => {
    class ClassDirective extends DisplayDirective {
        // Parsing
        parse() {
            if (this.key == null)
                throw new VivereError('Class directive requires a key');
        }
        // Evaluation
        evaluateValue(value) {
            if (value)
                this.element.classList.add(this.key);
            else
                this.element.classList.remove(this.key);
        }
    }
    ClassDirective.id = 'v-class';
    return ClassDirective;
})();
export default ClassDirective;
