import DisplayDirective from './display';
import DOM from '../../lib/dom';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-class';


  // Evaluation

  evaluateValue(value: unknown): void {
    const { element, key, lastValue, modifiers } = this;

    if (key)
      // If we have a key (and modifiers), parse the value as a boolean for toggling classes
      [key, ...modifiers].forEach((className) => {
        DOM.toggleClass(element, className, !!value);
      });
    else {
      if (Array.isArray(lastValue))
        // Otherwise, disable any classes that were turned on as lastValue
        lastValue.forEach((className) => {
          DOM.toggleClass(element, className, false);
        });

      if (Array.isArray(value))
        // Turn on any classes described by the value
        value.forEach((className) => {
          DOM.toggleClass(element, className, true);
        });
    }
  }
}
