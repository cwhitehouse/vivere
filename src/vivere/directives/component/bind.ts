import { Directive } from '../directive';

export class BindDirective extends Directive {
  static id: string             = 'v-bind';
  static forComponent: boolean  = true;

  // Parsing

  parse() {
    this.component.$bindings[this.key] = this.expression;
  }
};
