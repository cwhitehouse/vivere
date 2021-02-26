import DisplayDirective from './display';
import VivereError from '../../error';
import DOM from '../../lib/dom';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-class';

  // Parsing

  parse(): void {
    if (this.key == null) throw new VivereError('Class directive requires a key');
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    const { element, key, modifiers } = this;

    [key, ...modifiers].forEach((className) => {
      DOM.toggleClass(element, className, !!value);
    });
  }
}
