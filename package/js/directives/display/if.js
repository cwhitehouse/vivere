import DisplayDirective from './display';
import DOM from '../../lib/dom';
let IfDirective = /** @class */ (() => {
    class IfDirective extends DisplayDirective {
        // Parsing
        parse() {
            this.container = this.element.parentElement;
            this.placeholder = document.createComment('');
            this.current = this.element;
        }
        // Evaluation
        evaluateValue(value) {
            DOM.conditionallyRender(this, !!value);
        }
    }
    IfDirective.id = 'v-if';
    return IfDirective;
})();
export default IfDirective;
