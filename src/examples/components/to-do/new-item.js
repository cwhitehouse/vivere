export default {
  passed: {
    showing: {
      type: Boolean,
      default: true,
    },
  },

  data: {
    label: null,
  },

  computed: {
    hasLabel() {
      return this.label != null
        && this.label.length > 0;
    },
  },

  watch: {
    showing() {
      if (this.showing)
        this.$nextRender(() => this.$refs.input.focus());
    },
  },

  methods: {
    reset() {
      this.close();
    },

    create() {
      if (this.hasLabel)
        this.$emit('create', this.label);
      this.close();
    },

    close() {
      this.$emit('cancel');
      this.label = null;
    },
  }
};
