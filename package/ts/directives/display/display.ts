import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import VivereError from '../../error';

export default class DisplayDirective extends Directive {
  // Evaluation

  evaluate(): void {
    const callback = (): void => { this.component.$queueRender(this); };
    Watcher.watch(this, callback, () => {
      const value = Evaluator.read(this.component, this.expression);
      this.evaluateValue(value);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateValue(value: unknown): void {
    throw new VivereError('Directives must implement `evaluateValue`');
  }
}
