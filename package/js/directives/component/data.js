import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';
let DataDirective = /** @class */ (() => {
    class DataDirective extends Directive {
        // Parsing
        parse() {
            let expression;
            try {
                expression = JSON.parse(this.expression);
            }
            catch (err) {
                expression = Evaluator.parsePrimitive(this.expression) || this.expression;
            }
            const camelKey = Utility.camelCase(this.key);
            this.component.$set(camelKey, expression);
        }
    }
    DataDirective.id = 'v-data';
    DataDirective.forComponent = true;
    DataDirective.shouldRehydrate = false;
    return DataDirective;
})();
export default DataDirective;
