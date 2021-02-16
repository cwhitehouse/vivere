import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import VivereError from '../../error';

export default class SyncDirective extends DisplayDirective {
  static id = 'v-sync';

  element: HTMLInputElement;
  event: string;
  binding: (event: Event) => boolean;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'INPUT' && nodeName !== 'SELECT' && nodeName !== 'TEXTAREA')
      throw new VivereError(`Sync directives only work on input elements, not ${nodeName}`);

    // Bind the sync function
    this.event = 'input';
    this.binding = this.sync.bind(this);

    // Listen for input changes
    this.element.addEventListener(this.event, this.binding);

    // Run an initial sync
    this.sync();
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    // Push our new value to the element
    if (this.element.type === 'checkbox')
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
    if (this.element.type === 'checkbox')
      return this.element.checked;

    return this.element.value;
  }

  sync(): void {
    // Assign the value to the synced expression
    const inputValue = this.value();
    Evaluator.assign(this.component, this.expression, inputValue);
  }
}
