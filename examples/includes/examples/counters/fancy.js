export default {
  stored: {
    count: {
      type: 'session',
      defaultValue: 0,
    }
  },

  computed: {
    countHigh() {
      const { count } = this;
      return count >= 5;
    },

    logMessage() {
      const { countHigh } = this;

      if (countHigh) return '< THE COUNT IS NOW HIGH! >';
      return '> THE COUNT IS NOW LOW <';
    },

    canDecrement() {
      const { count } = this;
      return count > 0;
    },
  },

  watch: {
    countHigh() {
      const { logMessage } = this;
      console.log(logMessage);
    },
  },
}
