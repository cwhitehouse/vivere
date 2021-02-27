export default {
  stored: {
    activeSection: {
      default: null,
      type: 'local',
    },
  },

  connected() {
    const { $children, activeSection } = this;

    if (activeSection == null)
      this.activeSection = $children[0].value;
  },

  methods: {
    selectSection(value) {
      this.$set('activeSection', value);
    },
  },
};
