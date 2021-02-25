import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import VivereError from '../../error';
let SyncDirective = /** @class */ (() => {
    class SyncDirective extends DisplayDirective {
        // Parsing
        parse() {
            // Validate our element node
            const { nodeName } = this.element;
            if (nodeName !== 'INPUT' && nodeName !== 'SELECT' && nodeName !== 'TEXTAREA')
                throw new VivereError(`Sync directives only work on input elements, not ${nodeName}`);
            // Bind the sync function
            this.event = 'input';
            this.binding = this.sync.bind(this);
            // Listen for input changes
            this.element.addEventListener(this.event, this.binding);
            const initialValue = this.parseExpression();
            if (initialValue)
                // If we have an initial value, assign that value
                this.evaluateValue(initialValue);
            else
                // Otherwise set the data from the element
                this.sync();
        }
        // Evaluation
        evaluateValue(value) {
            // Push our new value to the element
            if (this.element instanceof HTMLInputElement && this.element.type === 'checkbox')
                this.element.checked = !!value;
            else
                this.element.value = value;
        }
        // Destruction
        // - detach the event listener
        destroy() {
            this.element.removeEventListener(this.event, this.binding);
        }
        // Syncing
        value() {
            if (this.element instanceof HTMLInputElement && this.element.type === 'checkbox')
                return this.element.checked;
            return this.element.value;
        }
        sync() {
            // Assign the value to the synced expression
            const inputValue = this.value();
            Evaluator.assign(this.component, this.expression, inputValue);
        }
    }
    SyncDirective.id = 'v-sync';
    return SyncDirective;
})();
export default SyncDirective;
