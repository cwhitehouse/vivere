import { Directive } from '../directive';
import Evaluator from '../../lib/evaluator';

export class EventDirective extends Directive {
  event:    'click' | 'keydown' | 'mouseenter' | 'mouseleave' | 'mouseover';
  binding:  (event: Event) => boolean;

  // Parsing

  parse() {
    this.event = this.id().split('-')[1] as 'click' | 'keydown' | 'mouseenter' | 'mouseleave' | 'mouseover';
    this.binding = this.execute.bind(this);
    this.element.addEventListener(this.event, this.binding);
  }


  // Evaluation
  // - event directives don't evaluate

  evaluate() {}


  // Destruction (detach event listeners)

  destroy() {
    this.element.removeEventListener(this.event, this.binding);
  }


  // Execution

  execute(e: Event) {
    // Execute the method defined in the evaluator
    Evaluator.execute(this.component, this.expression, e);
  }
}
