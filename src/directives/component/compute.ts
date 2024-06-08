import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

export default class ComputeDirective extends RootDirective {
  static id = 'v-compute';

  // Parsing

  evaluate(): void {
    const { camelKey, component, expression } = this;

    component.$set(camelKey, null, () => {
      Evaluator.compute(component, expression);
    }, null);
  }
}
