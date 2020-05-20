import { DisplayDirective } from './display';
import Evaluator from '../../lib/evaluator';

export class SyncDirective extends DisplayDirective {
  static id: string = 'v-sync';

  element:  HTMLInputElement;
  event:    string;
  binding:  (event: Event) => boolean;


  // Parsing

  parse() {
    // Validate our element node
    if (this.element.nodeName !== 'INPUT')
      throw 'Sync directives only work on input elements';

    // Bind the sync function
    this.event = 'input';
    this.binding = this.sync.bind(this);

    // Listen for input changes
    this.element.addEventListener(this.event, this.binding);

    // Run an initial sync
    this.sync();
  }


  // Evaluation

  evaluateValue(value: any) {
    // Push our new value to the element
    if (this.element.type === 'checkbox') this.element.checked = value;
    this.element.value = value;
  }


  // Destruction
  // - detach the event listener

  destroy() {
    this.element.removeEventListener(this.event, this.binding);
  }


  // Syncing

  value() {
    if (this.element.type === 'checkbox') return this.element.checked;
    return this.element.value;
  }

  sync() {
    // Assign the value to the synced expression
    const inputValue = this.value();
    Evaluator.assign(this.component, this.expression, inputValue);
  }
};
