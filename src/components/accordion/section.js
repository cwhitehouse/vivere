export default {
  methods: {
    select() {
      this.$emit('select', this.value);
    },

    isActive() {
      return this.value === this.activeSection;
    },
  },
};
