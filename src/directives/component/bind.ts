import Utility from '../../lib/utility';
import Directive from '../directive';

export default class BindDirective extends Directive {
  static id = 'v-bind';
  static forComponent = true;
  static requiresKey = true;

  // Parsing

  parse(): void {
    const { context, expression, key } = this;

    const camelKey = Utility.camelCase(key);
    context.bindings[camelKey] = (expression || camelKey);
  }
}
