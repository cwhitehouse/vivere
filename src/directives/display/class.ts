import DisplayDirective from './display';
import DOM from '../../lib/dom';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-class';

  static shortcut = '🎨:';

  // Evaluation

  evaluateValue(value: unknown): void {
    const { element, rawKey, lastValue } = this;

    if (rawKey) {
      // If we have a key (and modifiers), parse the value as a boolean for toggling classes
      // (Also parse the key as a dot separated list)
      const keyParts = rawKey.split('.');
      [...keyParts].forEach((className) => {
        DOM.toggleClass(element, className, !!value);
      });
    } else {
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
