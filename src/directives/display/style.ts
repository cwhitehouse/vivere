import DisplayDirective from './display';
import Utility from '../../lib/utility';
import DirectiveError from '../../errors/directive-error';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-style';

  // Parsing

  parse(): void {
    if (this.key == null)
      throw new DirectiveError('Style directive requires a key', this);
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    const { element } = this;
    const key = Utility.camelCase(this.key);

    if (element instanceof HTMLElement)
      element.style[key] = value;
  }
}
