import DisplayDirective from './display';
import Utility from '../../lib/utility';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-style';

  static requiresKey = true;

  // Evaluation

  evaluateValue(value: unknown): void {
    const { element } = this;
    const key = Utility.camelCase(this.key);

    if (element instanceof HTMLElement)
      element.style[key] = value;
  }
}
