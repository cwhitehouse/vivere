export default {
  queryAttribute(root, attribute, func) {
    root.querySelectorAll(`[${attribute}]`).forEach(func);
  },
};
