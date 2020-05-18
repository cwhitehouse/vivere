import { DisplayDirective } from './display.js';

export class TextDirective extends DisplayDirective {
  static name = 'v-text';

  // Evaluation

  evaluateValue(value) {
    this.element.textContent = value;
  }
};
