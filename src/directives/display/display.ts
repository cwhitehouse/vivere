import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import DirectiveError from '../../errors/directive-error';

export default class DisplayDirective extends Directive {
  lastValue: any;


  // Evaluation

  parseExpression(): unknown {
    const { context, component, expression } = this;
    const callback = (): void => { context.queueRender(this); };

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
    const value = this.parseExpression();

    this.lastValue = value;
    this.evaluateValue(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateValue(value: unknown): void {
    throw new DirectiveError('Directives must implement `evaluateValue`', this);
  }
}
