export default {
  data() {
    return {
      activeSection: null,
    };
  },

  callbacks: {
    beforeConnected() {
      this.activeSection = this.$children[0].value;
    },
  },

  methods: {
    selectSection(value) {
      this.$set('activeSection', value);
    },
  },
};
