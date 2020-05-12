export default {
  value(element, name) {
    return element.attributes[name].value;
  },

  normalize(name) {
    return name.split("-")
               .map((p) => `${p[0].toUpperCase()}${p.substring(1)}`)
               .join("");
  },

  normalized(element, name) {
    const value = this.value(element, name);
    return this.normalize(value);
  },
};
