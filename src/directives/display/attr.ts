import DisplayDirective from './display';
import Utility from '../../lib/utility';
import DirectiveError from '../../errors/directive-error';

export default class AttributeDirective extends DisplayDirective {
  static id = 'v-attr';

  static requiresKey = true;

  // Evaluation

  evaluateValue(value: unknown): void {
    const { element } = this;
    const $key = Utility.camelCase(this.key);

    // Map our $key to the proper value parsing
    switch ($key) {
      // The class attribute requires special handling
      case 'class':
        throw new DirectiveError('Class properties should be set with the v-class directive', this);
      // The style attribute should be set via v-style
      case 'style':
        throw new DirectiveError('Style properties should be set with the v-style directive', this);
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
