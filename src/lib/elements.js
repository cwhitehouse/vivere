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
          const dataValue = JSON.parse(attribute.value);
          component.$set(dataName, dataValue);
          element.removeAttribute(name);
        }
        if (name.startsWith('v-bind:')) {
          const bindingName = name.split(':')[1];
          const bindingValue = attribute.value;
          component.$bindings[bindingName] = bindingValue;
          element.removeAttribute(name);
        }
        if (parent != null && name.startsWith('v-pass')) {
          const dataName = name.split(':')[1].replace(/-([a-z])/g, g => g[1].toUpperCase());
          component.$pass(dataName, parent.$reactives[dataName]);
          element.removeAttribute(name);
        }
      });

      element.removeAttribute('v-component');
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
        element.removeAttribute(directive);
      });

      // Track display directives
      Directives.Display.forEach((directive) => {
        // Setup array of elements for the directive, if needed
        if (component.$livingElements[directive] == null) {
          component.$livingElements[directive] = [];
        }

        const value = attributes[directive]?.value;
        if (value != null) {
          // Track the element in the living
          // elements dictionary for rendering
          component.$livingElements[directive].push({ element, value });
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
