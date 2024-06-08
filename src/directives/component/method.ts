import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

export default class MethodDirective extends RootDirective {
  static id = 'v-method';

  // Parsing

  evaluate(): void {
    const { camelKey, component, expression } = this;
    component[camelKey] = (...args: unknown[]): unknown => Evaluator.execute(component, expression, ...args);
  }
}
