import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import VivereError from '../../lib/error';

interface DisplayDirectiveInterface {
  evaluateValue: (value: any) => void;
}

export default class DisplayDirective extends Directive implements DisplayDirectiveInterface {
  // Evaluation

  evaluate(): void {
    Watcher.assign(this, () => { this.component.$queueRender(this); });

    const value = Evaluator.read(this.component, this.expression);
    this.evaluateValue(value);

    Watcher.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateValue(value: any): void {
    throw new VivereError('Directives must implement `evaluateValue`');
  }
}
