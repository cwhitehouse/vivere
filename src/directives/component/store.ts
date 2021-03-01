import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';

export default class StoreDirective extends Directive {
  static id = 'v-store';
  static forComponent = true;
  static shouldRehydrate = false;

  // Parsing

  parse(): void {
    let expression: any;
    try {
      expression = JSON.parse(this.expression);
    } catch (err) {
      expression = Evaluator.parsePrimitive(this.expression) || this.expression;
    }

    const camelKey = Utility.camelCase(this.key);

    // Store the storage definition on the component
    const storageType = this.modifiers[0] || 'session';
    this.context.stored[camelKey] = { type: storageType, default: expression };

    // Add the reactive property
    this.context.$set(camelKey, expression);
  }
}
