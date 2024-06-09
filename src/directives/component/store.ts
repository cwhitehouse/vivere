import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

export default class StoreDirective extends RootDirective {
  static id = 'store';

  static shouldRehydrate = false;

  // Parsing

  process(): void {
    const { camelKey, component, expression, modifiers } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let $expression: any;
    try {
      $expression = JSON.parse(expression);
    } catch (err) {
      $expression = Evaluator.parsePrimitive(expression);
    }

    if ($expression === undefined)
      $expression = expression;

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
