import Directive from '../directive';
import Evaluator from '../../lib/evaluator';

export default class EventDirective extends Directive {
  event: 'click' | 'keydown' | 'mouseenter' | 'mouseleave' | 'mouseover';
  binding: (event: Event) => boolean;

  // Parsing

  parse(): void {
    this.event = this.id().split('-')[1] as 'click' | 'keydown' | 'mouseenter' | 'mouseleave' | 'mouseover';
    this.binding = this.execute.bind(this);
    this.element.addEventListener(this.event, this.binding);
  }


  // Destruction (detach event listeners)

  destroy(): void {
    this.element.removeEventListener(this.event, this.binding);
  }


  // Execution

  execute(e: Event): void {
    const { component, expression } = this;

    // We can automatically execute some assignment operations
    // without a mthod on the component
    if (Evaluator.isAssignmentOperation(expression))
      // Automatically evaluate the expression
      Evaluator.executeAssignment(component, expression);
    else
      // Execute the method defined in the evaluator
      Evaluator.execute(component, expression, e);
  }
}
