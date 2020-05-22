import DisplayDirective from './display';
const showClass = 'hidden';
let ShowDirective = /** @class */ (() => {
    class ShowDirective extends DisplayDirective {
        // Evaluation
        evaluateValue(value) {
            if (value)
                this.element.classList.remove(showClass);
            else
                this.element.classList.add(showClass);
        }
    }
    ShowDirective.id = 'v-show';
    return ShowDirective;
})();
export default ShowDirective;
