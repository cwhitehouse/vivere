import Directive from '../directive';
import Utility from '../../lib/utility';
import Evaluator from '../../lib/evaluator';

export default class ComputeDirective extends Directive {
  static id = 'v-compute';

  static forComponent = true;

  static requiresKey = true;

  camelKey: string;

  // Parsing

  parse(): void {
    const { component, expression } = this;

    this.camelKey = Utility.camelCase(this.key);
    this.component.$set(this.camelKey, null, () => Evaluator.compute(component, expression));
  }
}
