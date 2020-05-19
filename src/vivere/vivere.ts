import Polyfills from './lib/polyfills';
import Walk from './lib/walk';
import { Component } from './component';

export default {
  components: [],
  definitions: {},

  register(name: string, component: Component) {
    this.definitions[name] = component;
  },

  setup() {
    // Establish required Polyfills
    Polyfills.setup();

    // Walk the tree to initialize components
    Walk.tree(document.body);

    // Finalize connecting our components
    this.components.forEach((c: Component) => c.$connect());
  },
};
