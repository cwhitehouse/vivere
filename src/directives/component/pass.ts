import Directive from '../directive';
import Utility from '../../lib/utility';
import DirectiveError from '../../errors/directive-error';

export default class PassDirective extends Directive {
  static id = 'v-pass';

  static shortcut = '🎁:';

  static forComponent = true;

  static requiresKey = true;

  // Parsing

  parse(): void {
    const { component, expression } = this;
    const { $parent } = component;
    const key = Utility.camelCase(this.key);

    if ($parent == null)
      throw new DirectiveError('Cannot pass properties to a parentless component', this);

    let readKey: string;
    let idx: (number | null);

    if (expression != null && expression.length > 0) readKey = expression;
    else readKey = key;

    if (readKey.match(/([a-zA-Z0-9-_]+)\[([0-9]+)\]/)) {
      // If this looks like array access, we need to separate the index
      // and the read key (likely from a v-for directive)
      //   e.g. toDos[2]
      const [$readKey, rest] = readKey.split('[');
      const [index] = rest.split(']');

      readKey = $readKey;
      idx = parseInt(index, 10);
    }
    // Pass this to the component
    component.$pass(key, readKey, idx);
  }
}
