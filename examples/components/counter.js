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
  },

  watch: {
    countHigh() {
      console.log('countHigh changed!');
      console.log(` -> ${this.countHigh}`);
    },
  },
}