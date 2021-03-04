import Directive from '../directive';
import Utility from '../../lib/utility';
import DirectiveError from '../../errors/directive-error';
import ComponentError from '../../errors/component-error';

export default class PassDirective extends Directive {
  static id = 'v-pass';
  static forComponent = true;
  static requiresKey = true;

  // Parsing

  parse(): void {
    const { component, context, expression } = this;
    const { parent } = context;
    const { component: parentComponent } = parent;
    const key = Utility.camelCase(this.key);

    if (parent == null)
      throw new DirectiveError('Cannot pass properties to a parentless component', this);

    const passedProperties = context.passed[key];
    if (passedProperties == null)
      throw new DirectiveError(`Value passed to component for unknown key ${key}`, this);

    let readKey: string;
    if (expression != null && expression.length > 0) readKey = expression;
    else readKey = key;

    Object.defineProperty(component, readKey, {
      get() {
        let value = parentComponent[readKey];
        if (value == null) {
          if (passedProperties.required)
            throw new ComponentError(`${key} is required to be passed`, context.component);

          value = passedProperties.default;
        }

        return value;
      },
      set() {
        throw new ComponentError('Cannot update passed values from a child', context.component);
      },
    });

    // TODO: Solution for watching passed properties
    // reactive.registerHook(this, (newValue: unknown, oldValue: unknown) => context.react(key, newValue, oldValue));
  }
}
