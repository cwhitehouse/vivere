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
            this.camelKey = Utility.camelCase(this.key);
            this.component.$set(this.camelKey, expression);
        }
        // Dehydration
        dehydrate() {
            const jsonValue = JSON.stringify(this.component[this.camelKey]);
            this.element.setAttribute(`v-data:${this.key}`, jsonValue);
        }
    }
    DataDirective.id = 'v-data';
    DataDirective.forComponent = true;
    return DataDirective;
})();
export default DataDirective;
