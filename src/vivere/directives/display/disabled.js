import { DisplayDirective } from './display.js';

export class DisabledDirective extends DisplayDirective {
  static name = 'v-disabled';

  // Evaluation

  evaluateValue(value) {
    this.element.disabled = value;
  }
};
