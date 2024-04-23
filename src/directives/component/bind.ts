import Utility from '../../lib/utility';
import Directive from '../directive';

export default class BindDirective extends Directive {
  static id = 'v-bind';

  static shortcut = '🤝:';

  static forComponent = true;

  static requiresKey = true;

  // Parsing

  parse(): void {
    const { component, expression, key } = this;

    const camelKey = Utility.camelCase(key);
    component.$bindings[camelKey] = (expression || camelKey);
  }
}
