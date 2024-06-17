import DirectiveError from '../../errors/directive-error';
import Utility from '../../lib/utility';
import Directive from '../directive';

export default class RootDirective extends Directive {
  static forComponent = true;
  static requiresKey = true;

  camelKey: string;

  parse(): void {
    this.camelKey = Utility.camelCase(this.key);
    this.preprocess();
    this.process();
  }

  preprocess(): void {}

  process(): void {
    throw new DirectiveError('Directive mut implement process', this);
  }
}
