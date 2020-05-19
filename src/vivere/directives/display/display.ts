import { Directive } from '../directive';
import Evaluator from '../../lib/evaluator';
import { Watcher } from '../../reactivity/watcher';

export class DisplayDirective extends Directive {
  // Evaluation

  evaluate() {
    Watcher.assign(this, () => { this.component.$queueRender(this); });

    const value = Evaluator.read(this.component, this.expression);
    this.evaluateValue(value);

    Watcher.clear();
  }

  evaluateValue(value: any) {
    throw "Directives must implement `evaluateValue`";
  }
}
