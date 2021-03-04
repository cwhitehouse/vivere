export default {
  tag: null,

  passed: {
    filterTag: {},
  },

  get isOn() {
    const { filterTag, tag } = this;
    return filterTag === tag;
  },

  toggleFilter() {
    const { filterTag, tag } = this;

    let newFilter;
    if (tag === filterTag) newFilter = null;
    else newFilter = tag;

    this.$emit('updateFilter', newFilter);
    this.$element.blur();
  },
};
