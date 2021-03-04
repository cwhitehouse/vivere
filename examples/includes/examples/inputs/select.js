export default {
  stored: {
    value: {
      type: 'session',
      default: 'london',
    },
  },

  reset() {
    this.value = 'rome';
  },
}