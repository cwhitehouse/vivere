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
    const { expression, key, modifiers } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let $expression: any;
    try {
      $expression = JSON.parse(expression);
    } catch (err) {
      $expression = Evaluator.parsePrimitive(expression);
    }

    if ($expression === undefined)
      $expression = expression;

    const camelKey = Utility.camelCase(key);

    // Store the storage definition on the component
    const storageType = modifiers[0] || 'session';
    const storageModifier = modifiers[1] || null;
    component.$stored[camelKey] = {
      type: storageType,
      default: $expression,
      modifier: storageModifier,
    };

    // The stored property will be set once the component connects
  }
}
