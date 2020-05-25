import DisplayDirective from './display';
import DOM from '../../lib/dom';

const showClass = 'hidden';

export default class ShowDirective extends DisplayDirective {
  static id = 'v-show';

  // Evaluation

  evaluateValue(value: unknown): void {
    const { element } = this;
    DOM.toggleClass(element, showClass, !value);
  }
}
