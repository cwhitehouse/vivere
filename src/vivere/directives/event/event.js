import { Directive } from '../directive.js';
import Evaluator from '../../lib/evaluator.js';

export class EventDirective extends Directive {
  // Parsing

  parse() {
    const [_, event] = this.name().split('-');
    this.element.addEventListener(event, (e) => this.execute(e));
  }


  // Evaluation

  // Event directives do not evaluate on render
  evaluate() {}

  execute(e) {
    // Execute the method defined in the evaluator
    Evaluator.execute(this.component, this.expression, e);

    // Re-render the component
    this.component.render();
  }
}
