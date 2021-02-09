export default {
  data() {
    return {
      src: null,
      altSrc: null,
      hovering: false,
    };
  },

  computed: {
    computedSrc() {
      const { src, altSrc, hovering } = this;

      if (hovering) return altSrc;
      return src;
    },
  }
}