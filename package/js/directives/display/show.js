import DisplayDirective from './display';
import DOM from '../../lib/dom';
const showClass = 'hidden';
let ShowDirective = /** @class */ (() => {
    class ShowDirective extends DisplayDirective {
        // Evaluation
        evaluateValue(value) {
            const { element } = this;
            DOM.toggleClass(element, showClass, !value);
        }
    }
    ShowDirective.id = 'v-show';
    return ShowDirective;
})();
export default ShowDirective;
