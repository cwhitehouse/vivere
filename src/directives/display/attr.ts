import DisplayDirective from './display';
import Utility from '../../lib/utility';
import DOM from '../../lib/dom';

export default class AttributeDirective extends DisplayDirective {
  static id = 'attr';

  static shortcut = ':';

  static requiresKey = true;

  // Evaluation

  evaluateValue(value: unknown): void {
    const { element, key, lastValue, modifiers } = this;
    const $key = Utility.camelCase(key);

    // Map our $key to the proper value parsing
    switch ($key) {
      // The class attribute requires special handling
      case 'class':
        if (modifiers?.length)
          // If we have a modifiers, parse the value as a boolean for toggling classes
          // (Also parse the key as a dot separated list)
          modifiers.forEach((className) => {
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
        break;
      // The style attribute requires special handling
      case 'style':
        if (element instanceof HTMLElement)
          if (modifiers?.length)
            // If we have modifiers, assume we're trying to set the value
            // of multiple styles to a text value
            modifiers.forEach((style) => {
              element.style[style] = value;
            });
          else {
            if (typeof lastValue === 'object')
              // Otherwise, remove any styles set by the last value
              Object.keys(lastValue).forEach((style) => {
                element.style[style] = null;
              });

            if (typeof value === 'object')
              // Set any styles described by the value
              Object.entries(value).forEach(([style, val]) => {
                element.style[style] = val;
              });
          }
        break;
      // text / text-content set the textContent of the element
      case 'text':
      case 'textContent':
        element.textContent = value?.toString();
        break;
      // html / inner-html set the innerHTML of the element
      case 'html':
      case 'innerHtml':
        element.innerHTML = value?.toString();
        break;
      // Boolean attributes
      case 'disabled':
      case 'contenteditable':
      case 'draggable':
      case 'hidden':
      case 'novalidate':
      case 'open':
      case 'readonly':
      case 'required':
      case 'reversed':
      case 'spellcheck':
      case 'wrap':
        if (value)
          element.setAttribute($key, '');
        else
          element.removeAttribute($key);
        break;
      default:
        // eslint-disable-next-line no-case-declarations
        const $value = value?.toString();

        if ($value?.trim().length)
          element.setAttribute($key, $value);
        else
          element.removeAttribute($key);
    }
  }
}
