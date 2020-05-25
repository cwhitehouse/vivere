export default {
  passed: {
    filtering: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      text: null,
    };
  },

  watch: {
    text() {
      this.$emit('input', this.text);
    },
  },

  methods: {
    blur() {
      this.text = null;
    },
  },
};
