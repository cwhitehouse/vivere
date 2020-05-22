import DisplayDirective from './display';
import VivereError from '../../error';
let DisabledDirective = /** @class */ (() => {
    class DisabledDirective extends DisplayDirective {
        // Parsing
        parse() {
            // Validate our element node
            const { nodeName } = this.element;
            if (nodeName !== 'INPUT' && nodeName !== 'BUTTON')
                throw new VivereError('Sync directives only work on input elements');
        }
        // Evaluation
        evaluateValue(value) {
            this.element.disabled = !!value;
        }
    }
    DisabledDirective.id = 'v-disabled';
    return DisabledDirective;
})();
export default DisabledDirective;
