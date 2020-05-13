import { Component } from '../vivere/component.js';
import Directives from '../vivere/directives.js';
import Vivere from '../vivere/vivere.js';

export default {
  walkTree(element, component = null) {
    const attributes = element.attributes;

    // v-static: stop the tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // If the element is a component, initialize it
    const componentName = attributes['v-component']?.value;
    if (componentName != null) {
      const parent = component;
      component = new Component(element, componentName, parent);
      Vivere.components.push(component);

      attributes.forEach((idx,attribute) => {
        const name = attribute.name;
        if (name.startsWith('v-data:')) {
          const dataName = name.split(':')[1];
          const dataValue = attribute.value;
          component.$set(dataName, dataValue);
        }
        if (parent != null && name.startsWith('v-pass')) {
          const dataName = name.split(':')[1].replace(/-([a-z])/g, g => g[1].toUpperCase());
          component.$pass(dataName, parent.$reactives[dataName]);
        }
      });
    }

    // If we have a component, look for directives
    if (component != null) {
      // Activate event listeners
      Directives.Event.forEach((directive) => {
        const value = attributes[directive]?.value;
        if (value != null) {
          // Add the event listener if the
          // directive has a value
          const event = directive.split('-')[1];
          element.addEventListener(event, e => component.$handleEvent(e, value));
        }
      });

      // Track display directives
      Directives.Display.forEach((directive) => {
        // Setup array of elements for the directive
        component.$livingElements[directive] = [];

        const value = attributes[directive]?.value;
        if (value != null) {
          // Track the element in the living
          // elements dictionary for rendering
          component.$livingElements[directive].push({ element, value });
        }
      });
    }

    element.children.forEach((_,el) => {
      // Continue checking the
      // element's children
      if (typeof el === 'object') {
        // Only check nodes
        this.walkTree(el, component);
      }
    });
  }
};
