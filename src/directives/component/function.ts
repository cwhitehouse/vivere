import Evaluator from '../../lib/evaluator';
import RootDirective from './root';

export default class FunctionDirective extends RootDirective {
  static id = 'func';

  static shortcut = '$';

  // Parsing

  process(): void {
    const { camelKey, component, expression } = this;
    component[camelKey] = (...args: unknown[]): unknown =>
      Evaluator.execute(component, expression, ...args);
  }
}
