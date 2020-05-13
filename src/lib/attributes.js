export default {
  normalize(name) {
    return name.split("-")
               .map((p) => `${p[0].toUpperCase()}${p.substring(1)}`)
               .join("");
  },
};
