export default {
  Display: [
    'v-class',
    'v-disabled',
    'v-if',
    'v-text',
  ],

  Event: [
    'v-click',
    'v-mouseenter',
    'v-mouseleave',
  ],

  parse(directive, element, func) {
    element.attributes.forEach((_, attr) => {
      const name = attr.name;
      if (name.startsWith(directive)) {
        const [_, key] = name.split(':');
        let expression;
        try { expression = JSON.parse(attr.value); }
        catch (err) { expression = attr.value; }

        func(key, expression);

        element.removeAttribute(attr);
      }
    });
  },
}
