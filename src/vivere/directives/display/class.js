import { DisplayDirective } from './display.js';

export class ClassDirective extends DisplayDirective {
  static name = 'v-class';

  // Parsing

  parse() {
    if (this.key == null) {
      throw "Class directive requires a key";
    }
  }


  // Evaluation

  evaluateValue(value) {
    const method = value ? 'add' : 'remove';
    this.element.classList[method](this.key);
  }
};
