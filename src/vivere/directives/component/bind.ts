import Directive from '../directive';

export default class BindDirective extends Directive {
  static id = 'v-bind';
  static forComponent = true;

  // Parsing

  parse(): void {
    this.component.$bindings[this.key] = this.expression;
  }
}
