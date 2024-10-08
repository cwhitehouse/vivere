import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import DirectiveError from '../../errors/directive-error';
import ErrorHandler from '../../lib/error-handler';

export default class SyncDirective extends DisplayDirective {
  static id = 'sync';

  element:
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | HTMLParagraphElement
    | HTMLSpanElement
    | HTMLDialogElement;

  event: string;

  binding: (event: Event) => boolean;

  observer?: MutationObserver;

  // Parsing

  parse(): void {
    // Validate our element node
    const { element } = this;
    const { nodeName } = element;

    const validNode =
      ['INPUT', 'SELECT', 'TEXTAREA', 'DIALOG'].includes(nodeName) ||
      (['SPAN', 'P'].includes(nodeName) && element.contentEditable);

    if (!validNode)
      throw new DirectiveError(
        `Sync directives only work on input elements, contenteditable nodes, and dialogs not ${nodeName}`,
        this,
      );

    // Bind the sync function
    this.binding = this.sync.bind(this);

    // Get the proper event listeners
    const isRadio =
      element instanceof HTMLInputElement && element.type === 'radio';

    if (isRadio) this.event = 'change';
    else this.event = 'input';

    // Listen for changes to a select's options
    if (element instanceof HTMLSelectElement) {
      this.observer = new MutationObserver(() => {
        this.evaluateValue(this.parseExpression(), false);
      });
      this.observer.observe(element, { childList: true });
    }

    // Listen for opening of a dialog
    if (element instanceof HTMLDialogElement) {
      this.observer = new MutationObserver(() => {
        this.sync();
      });
      this.observer.observe(element, {
        attributes: true,
        attributeFilter: ['open'],
      });
    }
    // Listen for input changes
    else this.element.addEventListener(this.event, this.binding);

    const initialValue = this.parseExpression();
    if (initialValue)
      // If we have an initial value, assign that value
      this.evaluateValue(initialValue, false);
    // Otherwise set the data from the element
    else this.sync();
  }

  // Evaluation

  evaluateValue(value: unknown, shouldDispatch = true): void {
    ErrorHandler.handle(() => {
      const { element } = this;
      let oldValue: unknown;

      // Push our new value to the element
      if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        oldValue = element.checked;
        element.checked = !!value;
      } else if (
        element instanceof HTMLInputElement &&
        element.type === 'radio'
      ) {
        // Element value is always a string
        oldValue = element.checked;
        element.checked = element.value === value?.toString();
      } else if (
        element instanceof HTMLParagraphElement ||
        element instanceof HTMLSpanElement
      ) {
        oldValue = element.innerText;
        const valueString = value?.toString() || null;
        if (element.innerText !== valueString) element.innerText = valueString;
      } else if (element instanceof HTMLDialogElement)
        if (value)
          if (this.modifiers.includes('modal')) element.showModal();
          else element.show();
        else element.close();
      else {
        oldValue = element.value;
        element.value = value?.toString() || null;
      }

      if (shouldDispatch && oldValue?.toString() !== value?.toString()) {
        // If our value has changed (probably becase of assigning
        // to a component property), we should dispatch an input
        // event, so any other listeners are triggered
        const event = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(event);
      }
    });
  }

  // Destruction
  // - detach the event listener

  destroy(): void {
    this.element.removeEventListener(this.event, this.binding);
    this.observer?.disconnect();
  }

  // Syncing

  value(): string | boolean {
    const { element } = this;

    if (
      element instanceof HTMLInputElement &&
      ['checkbox', 'radio'].includes(element.type)
    )
      return element.checked;

    if (
      element instanceof HTMLParagraphElement ||
      element instanceof HTMLSpanElement
    )
      return element.textContent;

    if (element instanceof HTMLDialogElement) return element.open;

    return element.value;
  }

  sync(): boolean {
    const { element } = this;

    // Assign the value to the synced expression
    let inputValue = this.value();
    if (element instanceof HTMLInputElement && element.type === 'radio')
      if (inputValue) inputValue = element.value;
      else return true;

    Evaluator.assign(this.component, this.expression, inputValue);

    return true;
  }
}
