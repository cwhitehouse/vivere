import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

export default class DataDirective extends RootDirective {
  static id = 'v-data';

  static shouldRehydrate = false;

  // Parsing

  evaluate(): void {
    const { camelKey, expression } = this;

    let value: unknown;
    try {
      value = JSON.parse(expression);
    } catch (err) {
      value = Evaluator.parsePrimitive(expression);
    }

    if (value === undefined)
      value = expression;

    this.component.$set(camelKey, value);
  }
}
