import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';

export default class StoreDirective extends Directive {
  static id = 'v-store';
  static forComponent = true;
  static requiresKey = true;
  static shouldRehydrate = false;

  // Parsing

  parse(): void {
    const { component, context, expression, key, modifiers } = this;

    let $expression: any;
    try {
      $expression = JSON.parse(expression);
    } catch (err) {
      $expression = Evaluator.parsePrimitive(component, expression) || expression;
    }

    const camelKey = Utility.camelCase(key);

    // Store the storage definition on the component
    const storageType = modifiers[0] || 'session';
    context.stored[camelKey] = { type: storageType, default: $expression };

    // Add the reactive property
    context.$set(camelKey, $expression);
  }
}
