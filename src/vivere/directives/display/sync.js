import { DisplayDirective } from './display.js';
import Evaluator from '../../lib/evaluator.js';

export class SyncDirective extends DisplayDirective {
  static name = 'v-sync';

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

  sync(e) {
    // Assign the value to the synced expression
    Evaluator.assign(this.component, this.expression, this.value());

    // Render after synced values update
    this.component.render();
  }
};
