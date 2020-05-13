export default {
  data: {
    title: null,
  },

  methods: {
    reset() {
      this.close();
    },

    create() {
      this.close();
    },

    close() {
      this.$emit('cancel');
      this.title = null;
    },
  }
};
