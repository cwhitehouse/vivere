import Directive from '../directive';
import Reactive from '../../reactivity/reactive';
import VivereError from '../../error';
import Utility from '../../lib/utility';

export default class PassDirective extends Directive {
  static id = 'v-pass';
  static forComponent = true;

  // Parsing

  parse(): void {
    const { component, expression } = this;
    const parent = component.$parent;
    const key = Utility.camelCase(this.key);

    if (parent == null)
      throw new VivereError('Cannot pass properties to a parentless component');

    let readKey: string;
    if (expression != null && expression.length > 0) readKey = expression;
    else readKey = key;

    const reactive: Reactive = parent.$reactives[readKey] || parent.$computeds[readKey];
    if (reactive == null)
      throw new VivereError(`Cannot pass property, parent does not define ${readKey}`);

    reactive.registerHook(this, (newValue: unknown, oldValue: unknown) => component.$react(key, newValue, oldValue));

    component.$pass(key, reactive);
  }
}
