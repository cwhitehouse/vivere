export default {
  properties: {
    show: true,
    toggle: true,
  },

  toggleShow() {
    this.show = !this.show;
  },

  toggleText() {
    this.toggle = !this.toggle;
  },

  headerText() {
    if (this.toggle) {
      return "Toggle is on";
    }
    return "Toggle is off";
  },
};
