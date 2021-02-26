import DisplayDirective from './display';
import VivereError from '../../error';
import Utility from '../../lib/utility';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-style';

  // Parsing

  parse(): void {
    if (this.key == null) throw new VivereError('Style directive requires a key');
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    const { element } = this;
    const key = Utility.camelCase(this.key);

    if (element instanceof HTMLElement)
      element.style[key] = value;
  }
}
