import { Directive } from '../directive.js';
import Utility from '../../lib/utility.js';

export class DataDirective extends Directive {
  static name = 'v-data';
  static forComponent = true;

  // Parsing

  parse() {
    let expression;
    try { expression = JSON.parse(this.expression); }
    catch (err) { expression = this.expression; }

    const camelKey = Utility.camelCase(this.key);
    this.component.$set(camelKey, expression);
  }
};
