export default {
  setupObjectForEach() {
    Object.prototype.forEach = function(func) {
      Object.entries(this).forEach(([key, value]) => {
        func(key, value);
      });
    };
  },

  setup() {
    this.setupObjectForEach();
  },
};
