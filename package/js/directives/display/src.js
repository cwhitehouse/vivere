import DisplayDirective from './display';
import VivereError from '../../error';
let SrcDirective = /** @class */ (() => {
    class SrcDirective extends DisplayDirective {
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
    SrcDirective.id = 'v-src';
    return SrcDirective;
})();
export default SrcDirective;
