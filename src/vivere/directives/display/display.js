import { Directive } from '../directive.js';
import Evaluator from '../../lib/evaluator.js';

export class DisplayDirective extends Directive {
  // Evaluation

  evaluate() {
    const value = Evaluator.read(this.component, this.expression);
    this.evaluateValue(value);
  }

  evaluateValue(value) {
    throw "Directives must implement `evaluateValue`";
  }
}
