import { Component } from './component.js';
import Elements from '../lib/elements.js';
import Polyfills from '../lib/polyfills.js';

export default {
  components: {},

  register(name, component) {
    this.components[name] = component;
  },

  setup() {
    Polyfills.setup();
    Elements.queryAttribute(document, 'v-component', (el) => {
      Component.setup(el, this);
    });
  },
};
