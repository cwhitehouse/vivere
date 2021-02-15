import DisplayDirective from './display';
import DOM from '../../lib/dom';
let IfDirective = /** @class */ (() => {
    class IfDirective extends DisplayDirective {
        // Parsing
        parse() {
            this.container = this.element.parentElement;
            this.placeholder = document.createComment('');
            this.current = this.element;
            this.element.removeAttribute('hidden');
        }
        // Evaluation
        evaluateValue(value) {
            DOM.conditionallyRender(this, !!value);
        }
        // Dehdyration
        dehydrate() {
            // Re-attach element to the DOM
            DOM.conditionallyRender(this, true);
            // Dehydrate
            super.dehydrate();
        }
    }
    IfDirective.id = 'v-if';
    return IfDirective;
})();
export default IfDirective;
