import Directive from './directive';
import Evaluator from '../lib/evaluator';

export default class EventDirective extends Directive {
  static id = 'v-event';

  binding: (event: Event) => boolean;

  // Parsing

  parse(): void {
    this.binding = this.execute.bind(this);
    this.element.addEventListener(this.key, this.binding);
  }


  // Destruction (detach event listeners)

  destroy(): void {
    this.element.removeEventListener(this.key, this.binding);
  }


  // Execution

  execute(e: Event): void {
    const { component, expression, modifiers } = this;

    // Keydown Directives can be scoped via modifiers
    if (e instanceof KeyboardEvent && modifiers != null && modifiers.length > 0) {
      const keyCode = e.key || e.keyCode;
      const matchesModifier = modifiers.some((mod) => this.matchesKeycode(keyCode, mod));
      if (!matchesModifier) return;
    }

    // Allow preventing default via modifiers
    if (modifiers != null && modifiers.indexOf('prevent') > 0)
      e.preventDefault();

    // We can automatically execute some assignment operations
    // without a mthod on the component
    if (Evaluator.isAssignmentOperation(expression))
      // Automatically evaluate the expression
      Evaluator.executeAssignment(component, expression);
    else
      // Execute the method defined in the evaluator
      Evaluator.execute(component, expression, e);
  }

  // Key matching

  matchesKeycode(keyCode: string | number, keyEvent: string): boolean {
    switch (keyEvent) {
      case 'enter':
      case 'ent':
        return keyCode === 'Enter'
          || keyCode === 13;
      case 'escape':
      case 'esc':
        return keyCode === 'Escape'
          || keyCode === 27;
      default:
    }

    if (typeof keyCode === 'string')
      return keyEvent === keyCode.toLowerCase();
    return keyEvent === keyCode.toString();
  }
}
