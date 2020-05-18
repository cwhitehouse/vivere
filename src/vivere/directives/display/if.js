import { DisplayDirective } from './display.js';

export class IfDirective extends DisplayDirective {
  static name = 'v-if';

  // Evaluation

  evaluateValue(value) {
    const method = value ? 'remove' : 'add';
    this.element.classList[method]('hidden');
  }
};
