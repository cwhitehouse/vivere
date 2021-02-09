import DisplayDirective from './display';
import VivereError from '../../error';
let HrefDirective = /** @class */ (() => {
    class HrefDirective extends DisplayDirective {
        // Parsing
        parse() {
            // Validate our element node
            const { nodeName } = this.element;
            if (nodeName !== 'IMG')
                throw new VivereError(`Src directives only work on image elements, not ${nodeName}`);
        }
        // Evaluation
        evaluateValue(value) {
            this.element.src = (value && value.toString());
        }
    }
    HrefDirective.id = 'v-src';
    return HrefDirective;
})();
export default HrefDirective;
