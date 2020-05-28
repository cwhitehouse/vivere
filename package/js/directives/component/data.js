import Directive from '../directive';
import Utility from '../../lib/utility';
let DataDirective = /** @class */ (() => {
    class DataDirective extends Directive {
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
            this.component.$set(camelKey, expression);
        }
    }
    DataDirective.id = 'v-data';
    DataDirective.forComponent = true;
    DataDirective.shouldRehydrate = false;
    return DataDirective;
})();
export default DataDirective;
