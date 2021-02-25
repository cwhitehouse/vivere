import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';

export default class DataDirective extends Directive {
  static id = 'v-data';
  static forComponent = true;

  camelKey: string;

  // Parsing

  parse(): void {
    let expression: unknown;
    try {
      expression = JSON.parse(this.expression);
    } catch (err) {
      expression = Evaluator.parsePrimitive(this.expression) || this.expression;
    }

    this.camelKey = Utility.camelCase(this.key);
    this.component.$set(this.camelKey, expression);
  }


  // Dehydration

  dehydrate(): void {
    const jsonValue = JSON.stringify(this.component[this.camelKey]);
    this.element.setAttribute(`v-data:${this.key}`, jsonValue);
  }
}
