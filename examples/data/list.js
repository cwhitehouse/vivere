export default {
  uniqueness(value, index, array) {
    return array.indexOf(value) === index;
  },

  directives(a, b) {
    const aDirective = a.startsWith('v-');
    const bDirective = b.startsWith('v-');

    if (aDirective && bDirective) return a > b ? 1 : -1;
    if (aDirective) return -1;
    if (bDirective) return 1;
    return a > b ? 1 : -1;
  },
};
