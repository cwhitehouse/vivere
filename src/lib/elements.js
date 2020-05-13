import { Component } from '../vivere/component.js';
import Directives from '../vivere/directives.js';
import Vivere from '../vivere/vivere.js';

export default {
  walkTree(element, component = null) {
    const attributes = element.attributes;

    // v-static: stop the tree walking for improved performance
    if (attributes['v-static'] != null) return;

    // If the element is a component, initialize it
    Directives.parse('v-component', element, (_, name) => {
      const parent = component;
      component = new Component(element, name, parent);
      Vivere.components.push(component);

      // Pass data to the component
      Directives.parse('v-data', element, (key, value) => {
        component.$set(key, value);
      });

      // Bind event listeners
      Directives.parse('v-bind', element, (key, value) => {
        component.$bindings[key] = value;
      });

      // Pass properties from parent
      Directives.parse('v-pass', element, (key, _) => {
        if (parent == null) throw "Cannot pass properties to a parentless component";
        component.$pass(key, parent.$reactives[key]);
      });
    });

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
        element.removeAttribute(directive);
      });

      // Track display directives
      Directives.Display.forEach((directive) => {
        // Setup array of elements for the directive, if needed
        if (component.$directives[directive] == null) {
          component.$directives[directive] = [];
        }

        const value = attributes[directive]?.value;
        if (value != null) {
          // Track the element in the living
          // elements dictionary for rendering
          component.$directives[directive].push({ element, value });
        }
        element.removeAttribute(directive);
      });

      // Set up syncing if it's for a special element
      const syncValue = attributes['v-sync']?.value;
      if (syncValue != null) {
        if (element.nodeName !== 'INPUT') throw 'Sync directives only work on inputs';
        element.addEventListener('input', e => component.$sync(e, element, syncValue));
      }
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
