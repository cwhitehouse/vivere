import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import VivereError from '../../error';

export default class DisplayDirective extends Directive {
  // Evaluation

  parseExpression(): unknown {
    const { component, expression } = this;
    const callback = (): void => { component.$queueRender(this); };

    let value: unknown;
    Watcher.watch(this, callback, () => {
      if (Evaluator.isComparisonOperation(expression))
        value = Evaluator.evaluateComparison(component, expression);
      else
        value = Evaluator.parse(component, expression);
    });

    return value;
  }

  evaluate(): void {
    this.evaluateValue(this.parseExpression());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateValue(value: unknown): void {
    throw new VivereError('Directives must implement `evaluateValue`');
  }
}
