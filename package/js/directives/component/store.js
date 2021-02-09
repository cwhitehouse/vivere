import Directive from '../directive';
import Utility from '../../lib/utility';
let StoreDirective = /** @class */ (() => {
    class StoreDirective extends Directive {
        // Parsing
        parse() {
            let expression;
            try {
                expression = JSON.parse(this.expression);
            }
            catch (err) {
                expression = this.expression;
            }
            const camelKey = Utility.camelCase(this.key);
            // Store the storage definition on the component
            const storageType = this.modifiers[0] || 'session';
            this.component.$stored[camelKey] = { type: storageType, defaultValue: expression };
            // Add the reactive property
            this.component.$set(camelKey, expression);
        }
    }
    StoreDirective.id = 'v-store';
    StoreDirective.forComponent = true;
    StoreDirective.shouldRehydrate = false;
    return StoreDirective;
})();
export default StoreDirective;
