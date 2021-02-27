module.exports = {
  uniqueness(value, index, array) {
    return array.indexOf(value) === index;
  },
};
