export default {
  passed: {
    activeSection: {
      type: 'string',
      default: null,
    },
  },

  computed: {
    isActive() {
      const { activeSection, value } = this;
      return value === activeSection;
    },

    isInactive() {
      const { isActive } = this;
      return !isActive;
    },
  },

  methods: {
    select() {
      this.$emit('select', this.value);
    },
  },
};
