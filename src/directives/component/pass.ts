import Directive from '../directive';
import Utility from '../../lib/utility';
import DirectiveError from '../../errors/directive-error';
import Reactive from '../../reactivity/reactive';

export default class PassDirective extends Directive {
  static id = 'v-pass';
  static forComponent = true;
  static requiresKey = true;

  // Parsing

  parse(): void {
    const { context, expression } = this;
    const { parent } = context;
    const key = Utility.camelCase(this.key);

    if (parent == null)
      throw new DirectiveError('Cannot pass properties to a parentless component', this);

    const passedProperties = context.passed[key];
    if (passedProperties == null)
      throw new DirectiveError(`Value passed to component for unknown key ${key}`, this);

    let readKey: string;
    if (expression != null && expression.length > 0) readKey = expression;
    else readKey = key;

    const reactive: Reactive = parent.$reactives[readKey] || parent.computeds[readKey];
    if (reactive == null)
      throw new DirectiveError(`Cannot pass property, parent does not define ${readKey}`, this);

    reactive.registerHook(this, (newValue: unknown, oldValue: unknown) => context.react(key, newValue, oldValue));

    context.pass(key, reactive);
  }
}
