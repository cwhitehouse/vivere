export default {
  data() {
    return {
      count: 0,
    };
  },

  computed: {
    countHigh() {
      console.log('computing countHigh...');

      const { count } = this;
      return count >= 5;
    },
  },

  watch: {
    countHigh() {
      console.log('countHigh changed!');
      console.log(` -> ${this.countHigh}`);
      console.log('');
    },
  },
}