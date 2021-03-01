import Directive from '../directive';

export default class BindDirective extends Directive {
  static id = 'v-bind';
  static forComponent = true;

  // Parsing

  parse(): void {
    this.context.bindings[this.key] = this.expression;
  }
}