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
    const isRadio = element instanceof HTMLInputElement && element.type === 'radio';
    this.event = isRadio ? 'change' : 'input';
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
    let oldValue: unknown;

    // Push our new value to the element
    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      oldValue = element.checked;
      element.checked = !!value;
    } else if (element instanceof HTMLInputElement && element.type === 'radio') {
      // Element value is always a string
      oldValue = element.checked;
      element.checked = element.value === value?.toString();
    } else if (element instanceof HTMLParagraphElement || element instanceof HTMLSpanElement) {
      oldValue = element.innerText;
      const valueString = value?.toString() || null;
      if (element.innerText !== valueString)
        element.innerText = valueString;
    } else {
      oldValue = element.value;
      element.value = value?.toString() || null;
    }

    if (oldValue?.toString() !== value?.toString()) {
      // If our value has changed (probably becase of assigning
      // to a component property), we should dispatch an input
      // event, so any other listeners are triggered
      const event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    }
  }

  // Destruction
  // - detach the event listener

  destroy(): void {
    this.element.removeEventListener(this.event, this.binding);
  }

  // Syncing

  value(): string | boolean {
    const { element } = this;

    if (element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type))
      return element.checked;

    if (element instanceof HTMLParagraphElement || element instanceof HTMLSpanElement)
      return element.innerText;

    return element.value;
  }

  sync(): boolean {
    const { element } = this;

    // Assign the value to the synced expression
    let inputValue = this.value();
    if (element instanceof HTMLInputElement && element.type === 'radio')
      if (inputValue)
        inputValue = element.value;
      else
        return true;

    Evaluator.assign(this.component, this.expression, inputValue);

    return true;
  }
}
