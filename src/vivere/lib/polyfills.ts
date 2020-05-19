interface Object {
  forEach(func: Function): void;
}

export default {
  setupObjectForEach() {
    Object.prototype.forEach = function(func: Function) {
      Object.entries(this).forEach(([key, value]) => {
        func(key, value);
      });
    };
  },

  setup() {
    this.setupObjectForEach();
  },
};
