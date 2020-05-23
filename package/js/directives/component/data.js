import Directive from '../directive';
import Utility from '../../lib/utility';
import VivereError from '../../error';
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
            const { $definition } = this.component;
            const camelKey = Utility.camelCase(this.key);
            const keyDefined = camelKey in $definition.data?.();
            if (!keyDefined)
                throw new VivereError(`Component definitions must define any data passed with a v-data directive (${camelKey})`);
            this.component.$set(camelKey, expression);
        }
    }
    DataDirective.id = 'v-data';
    DataDirective.forComponent = true;
    DataDirective.shouldRehydrate = false;
    return DataDirective;
})();
export default DataDirective;
