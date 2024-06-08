import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

export default class PassDirective extends RootDirective {
  static id = 'v-pass';

  // Evaluation

  evaluate(): void {
    const { camelKey, component, expression } = this;
    const { $parent } = component;

    component.$set(camelKey, null, () => {
      Evaluator.compute($parent, expression);
    }, (value: unknown) => {
      Evaluator.assign($parent, expression, value);
    }, true);
  }
}
