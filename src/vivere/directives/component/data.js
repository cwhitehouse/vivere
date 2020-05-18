import { Directive } from '../directive.js';

export class DataDirective extends Directive {
  static name = 'v-data';
  static forComponent = true;

  // Parsing

  parse() {
    let expression;
    try { expression = JSON.parse(this.expression); }
    catch (err) { expression = this.expression; }

    this.component.$set(this.key, expression);
  }
};
