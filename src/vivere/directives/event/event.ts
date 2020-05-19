import { Directive } from '../directive';
import Evaluator from '../../lib/evaluator';

export class EventDirective extends Directive {
  // Parsing

  parse() {
    const [_, event] = this.id().split('-');
    this.element.addEventListener(event, (e) => this.execute(e));
  }


  // Evaluation (not needed on event directives)

  evaluate() {}


  // Execution

  execute(e: Event) {
    // Execute the method defined in the evaluator
    Evaluator.execute(this.component, this.expression, e);

    // Re-render the component
    this.component.render();
  }
}
