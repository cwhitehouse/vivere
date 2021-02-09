import Directive from '../directive';
import Utility from '../../lib/utility';

export default class StoreDirective extends Directive {
  static id = 'v-store';
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

    // Store the storage definition on the component
    const storageType = this.modifiers[0] || 'session';
    this.component.$stored[camelKey] = { type: storageType, defaultValue: expression };

    // Add the reactive property
    this.component.$set(camelKey, expression);
  }
}
