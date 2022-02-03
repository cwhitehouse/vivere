import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import DirectiveError from '../../errors/directive-error';

export default class SyncDirective extends DisplayDirective {
  static id = 'v-sync';

  element: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement);

  event: string;

  binding: (event: Event) => boolean;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'INPUT' && nodeName !== 'SELECT' && nodeName !== 'TEXTAREA')
      throw new DirectiveError(`Sync directives only work on input elements, not ${nodeName}`, this);

    // Bind the sync function
    this.event = 'input';
    this.binding = this.sync.bind(this);

    // Listen for input changes
    this.element.addEventListener(this.event, this.binding);

    const initialValue = this.parseExpression();
    if (initialValue)
      // If we have an initial value, assign that value
      this.evaluateValue(initialValue);
    else
      // Otherwise set the data from the element
      this.sync();
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    // Push our new value to the element
    if (this.element instanceof HTMLInputElement && this.element.type === 'checkbox')
      this.element.checked = !!value;
    else
      this.element.value = value as string;
  }

  // Destruction
  // - detach the event listener

  destroy(): void {
    this.element.removeEventListener(this.event, this.binding);
  }

  // Syncing

  value(): string | boolean {
    if (this.element instanceof HTMLInputElement && this.element.type === 'checkbox')
      return this.element.checked;

    return this.element.value;
  }

  sync(): void {
    // Assign the value to the synced expression
    const inputValue = this.value();
    Evaluator.assign(this.component, this.expression, inputValue);
  }
}
