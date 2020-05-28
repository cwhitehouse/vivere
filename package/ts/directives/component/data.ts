import Directive from '../directive';
import Utility from '../../lib/utility';

export default class DataDirective extends Directive {
  static id = 'v-data';
  static forComponent = true;
  static shouldRehydrate = false;

  // Parsing

  parse(): void {
    let expression: unknown;
    try {
      expression = JSON.parse(this.expression);
    } catch (err) {
      expression = this.expression;
    }

    const camelKey = Utility.camelCase(this.key);
    this.component.$set(camelKey, expression);
  }
}
