import Directive from '../directive';
import Utility from '../../lib/utility';
import VivereError from '../../error';

export default class DataDirective extends Directive {
  static id = 'v-data';
  static forComponent = true;

  // Parsing

  parse(): void {
    let expression: unknown;
    try {
      expression = JSON.parse(this.expression);
    } catch (err) {
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
