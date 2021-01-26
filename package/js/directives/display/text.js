import DisplayDirective from './display';
let TextDirective = /** @class */ (() => {
    class TextDirective extends DisplayDirective {
        // Evaluation
        evaluateValue(value) {
            this.element.textContent = (value && value.toString());
        }
    }
    TextDirective.id = 'v-text';
    return TextDirective;
})();
export default TextDirective;
