import { Directive } from './directive.js';

export class RefDirective extends Directive {
  static name = 'v-ref';

  // Parsing

  parse() {
    this.component.$refs[this.expression] = this.element;
  }
};
