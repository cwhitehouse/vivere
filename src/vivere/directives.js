import Attributes from '../lib/attributes.js';
import Elements from '../lib/elements.js';

export default {
  Display: [
    'v-if',
    'v-text',
  ],

  Event: [
    'v-click',
  ],

  queryElement(element, name, func) {
    Elements.queryAttribute(element, name, (el) => {
      const value = Attributes.value(el, name)
      func(el, value);
    });
  },
}
