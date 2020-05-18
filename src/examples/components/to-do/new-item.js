export default {
  data: {
    label: null,
  },

  methods: {
    reset() {
      this.close();
    },

    create() {
      this.$emit('create', this.label);
      this.close();
    },

    close() {
      this.$emit('cancel');
      this.label = null;
    },
  }
};
