import Polyfills from './lib/polyfills.js';
import Walk from './lib/walk.js';

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
    Walk.tree(document.body);

    // Finalize connecting our components
    this.components.forEach(c => c.$connect());
  },
};
