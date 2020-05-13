export default {
  data: {
    creating: false,
  },

  methods: {
    startCreating() {
      this.creating = true;
    },

    stopCreating() {
      this.creating = false;
    },
  },
};
