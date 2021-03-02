import DisplayDirective from './display';
import DOM from '../../lib/dom';
import DirectiveError from '../../errors/directive-error';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-class';

  // Parsing

  parse(): void {
    if (!this.key)
      throw new DirectiveError('Class directive requires a key', this);
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    const { element, key, modifiers } = this;

    [key, ...modifiers].forEach((className) => {
      DOM.toggleClass(element, className, !!value);
    });
  }
}
