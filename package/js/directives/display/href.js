import DisplayDirective from './display';
import VivereError from '../../error';
let HrefDirective = /** @class */ (() => {
    class HrefDirective extends DisplayDirective {
        // Parsing
        parse() {
            // Validate our element node
            const { nodeName } = this.element;
            if (nodeName !== 'A')
                throw new VivereError(`Href directives only work on anchor elements, not ${nodeName}`);
        }
        // Evaluation
        evaluateValue(value) {
            this.element.href = (value && value.toString());
        }
    }
    HrefDirective.id = 'v-href';
    return HrefDirective;
})();
export default HrefDirective;
