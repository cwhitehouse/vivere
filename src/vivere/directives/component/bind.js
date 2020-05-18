import { Directive } from '../directive.js';

export class BindDirective extends Directive {
  static name = 'v-bind';
  static forComponent = true;

  // Parsing

  parse() {
    this.component.$bindings[this.key] = this.expression;
  }
};
