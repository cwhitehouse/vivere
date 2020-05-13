export default {
  data: {
    hovering: false,
  },

  methods: {
    onMouseEnter() {
      this.hovering = true;
    },

    onMouseLeave() {
      this.hovering = false;
    },

    select() {
      this.$emit('select', this.value);
    },

    isActive() {
      return this.value === this.activeSection;
    },
  },
};
