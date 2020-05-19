import { Directive } from '../directive';
import Evaluator from '../../lib/evaluator';

export class DisplayDirective extends Directive {
  // Evaluation

  evaluate() {
    const value = Evaluator.read(this.component, this.expression);
    this.evaluateValue(value);
  }

  evaluateValue(value: any) {
    throw "Directives must implement `evaluateValue`";
  }
}
