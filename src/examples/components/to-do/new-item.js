export default {
  data: {
    label: null,
  },

  watch: {
    showing() {
      if (this.showing)
        this.$nextRender(() => this.$refs.input.focus());
    },
  },

  methods: {
    hasLabel() {
      return this.label != null
        && this.label.length > 0;
    },

    reset() {
      this.close();
    },

    create() {
      if (this.hasLabel())
        this.$emit('create', this.label);
      this.close();
    },

    close() {
      this.$emit('cancel');
      this.label = null;
    },
  }
};
