import { Directive } from '../directive';
import Utility from '../../lib/utility';

export class DataDirective extends Directive {
  static id: string             = 'v-data';
  static forComponent: boolean  = true;


  // Parsing

  parse() {
    let expression;
    try { expression = JSON.parse(this.expression); }
    catch (err) { expression = this.expression; }

    const camelKey = Utility.camelCase(this.key);
    this.component.$set(camelKey, expression);
  }
};
