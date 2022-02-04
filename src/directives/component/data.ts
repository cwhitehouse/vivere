import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';

export default class DataDirective extends Directive {
  static id = 'v-data';

  static forComponent = true;

  static requiresKey = true;

  static shouldRehydrate = false;

  camelKey: string;

  // Parsing

  parse(): void {
    const { expression } = this;

    let $expression: unknown;
    try {
      $expression = JSON.parse(expression);
    } catch (err) {
      $expression = Evaluator.parsePrimitive(expression);
    }

    if ($expression === undefined)
      $expression = expression;

    this.camelKey = Utility.camelCase(this.key);
    this.component.$set(this.camelKey, $expression);
  }
}
