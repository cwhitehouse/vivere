export default {
  camelCase(name) {
    return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  pascalCase(name) {
    const camel = this.camelCase(name);
    return `${camel[0].toUpperCase()}${camel.slice(1)}`;
  },
};
