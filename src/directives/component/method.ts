import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';

export default class MethodDirective extends Directive {
  static id = 'v-method';

  static forComponent = true;

  static requiresKey = true;

  camelKey: string;

  // Parsing

  parse(): void {
    const { component, expression } = this;

    this.camelKey = Utility.camelCase(this.key);
    this.component[this.camelKey] = () => {
      Evaluator.execute(component, expression);
    };
  }
}
