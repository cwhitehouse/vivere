export default {
  data: {
    activeSection: null,
  },

  callbacks: {
    beforeConnected() {
      console.log("Accordion : beforeConnected");
      this.activeSection = this.$children[0].value;
    },
  },

  methods: {
    select(value) {
      this.$set('activeSection', value);
    },
  },
};
