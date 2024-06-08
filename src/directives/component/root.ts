import Utility from '../../lib/utility';
import Directive from '../directive';

export default class RootDirective extends Directive {
  static forComponent = true;
  static requiresKey = true;

  camelKey: string;

  parse(): void {
    this.camelKey = Utility.camelCase(this.key);
    this.evaluate();
  }
}
