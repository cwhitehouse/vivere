import { DisplayDirective } from './display';
import Evaluator from '../../lib/evaluator';

export class SyncDirective extends DisplayDirective {
  static id: string = 'v-sync';


  // Parsing

  parse() {
    // Validate our element node
    if (this.element.nodeName !== 'INPUT') {
      throw 'Sync directives only work on input elements';
    }

    // Listen for input changes
    this.element.addEventListener('input', (e) => this.sync(e));
  }


  // Evaluation

  evaluateValue(value) {
    // Push our new value to the element
    if (this.element.type === 'checkbox') this.element.checked = value;
    this.element.value = value;
  }


  // Syncing

  value() {
    if (this.element.type === 'checkbox') return this.element.checked;
    return this.element.value;
  }

  sync(e: Event) {
    // Assign the value to the synced expression
    const inputValue = this.value();
    Evaluator.assign(this.component, this.expression, inputValue);

    // Render after synced values update
    this.component.render();
  }
};
