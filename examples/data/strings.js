module.exports = {
  camelCase(string) {
    return string.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  pascalCase(string) {
    if (!string)
      return null;

    const camel = this.camelCase(string);
    return `${camel[0].toUpperCase()}${camel.slice(1)}`;
  },
};
