import DisplayDirective from './display';
import DOM from '../../lib/dom';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-class';
  static requiresKey = true;


  // Evaluation

  evaluateValue(value: unknown): void {
    const { element, key, modifiers } = this;

    [key, ...modifiers].forEach((className) => {
      DOM.toggleClass(element, className, !!value);
    });
  }
}
