import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import DirectiveError from '../../errors/directive-error';

export default class DisplayDirective extends Directive {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastValue: any;

  // Evaluation

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseExpression(): any {
    const { component, expression } = this;
    const callback = (): void => { component.$queueRender(this); };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any;
    Watcher.watch(this, callback, () => {
      value = Evaluator.parse(component, expression);
    });

    return value;
  }

  evaluate(): void {
    const value = this.parseExpression();

    this.evaluateValue(value);
    this.lastValue = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateValue(value: unknown): void {
    throw new DirectiveError('Directives must implement `evaluateValue`', this);
  }
}
