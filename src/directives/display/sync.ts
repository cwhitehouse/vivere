import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import DirectiveError from '../../errors/directive-error';

export default class SyncDirective extends DisplayDirective {
  static id = 'v-sync';

  element: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLParagraphElement | HTMLSpanElement);

  event: string;

  binding: (event: Event) => boolean;

  // Parsing

  parse(): void {
    // Validate our element node
    const { element } = this;
    const { nodeName } = element;

    const validNode = ['INPUT', 'SELECT', 'TEXTAREA'].includes(nodeName)
      || (['SPAN', 'P'].includes(nodeName) && element.contentEditable);

    if (!validNode)
      throw new DirectiveError(`Sync directives only work on input elements or contenteditable nodes, not ${nodeName}`, this);

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
    const { element } = this;

    // Push our new value to the element
    if (element instanceof HTMLInputElement && element.type === 'checkbox')
      element.checked = !!value;
    else if (element instanceof HTMLParagraphElement || element instanceof HTMLSpanElement) {
      const valueString = value?.toString();
      if (element.innerText !== valueString)
        element.innerText = valueString;
    } else
      element.value = value as string;
  }

  // Destruction
  // - detach the event listener

  destroy(): void {
    this.element.removeEventListener(this.event, this.binding);
  }

  // Syncing

  value(): string | boolean {
    const { element } = this;

    if (element instanceof HTMLInputElement && element.type === 'checkbox')
      return element.checked;

    if (element instanceof HTMLParagraphElement || element instanceof HTMLSpanElement)
      return element.innerText;

    return element.value;
  }

  sync(): void {
    // Assign the value to the synced expression
    const inputValue = this.value();
    Evaluator.assign(this.component, this.expression, inputValue);
  }
}
