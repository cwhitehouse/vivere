export default {
  passed: {
    filtering: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      inputText: null,
    };
  },

  watch: {
    inputText() {
      this.$emit('input', this.inputText);
    },

    text() {
      this.inputText = this.text;
    },
  },

  methods: {
    clear() {
      this.inputText = null;
      this.blur();
    },

    blur() {
      this.$refs.input.blur();
    },
  },
};
