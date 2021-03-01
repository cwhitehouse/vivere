export default class {
  tag = null;

  passed = {
    filterTag: {},
  };

  toggleFilter() {
    const { filterTag, tag } = this;

    let newFilter;
    if (tag === filterTag) newFilter = null;
    else newFilter = tag;

    this.$emit('updateFilter', newFilter);
    this.$element.blur();
  }
};
