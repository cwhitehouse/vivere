import Elements from '../lib/elements.js';
import Polyfills from '../lib/polyfills.js';

export default {
  components: [],
  definitions: {},

  register(name, component) {
    this.definitions[name] = component;
  },

  setup() {
    // Establish required Polyfills
    Polyfills.setup();

    // Walk the tree to initialize components
    Elements.walkTree(document.body);

    // Finalize connecting our components
    this.components.forEach(c => c.$connect());
  },
};
