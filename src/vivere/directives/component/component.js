import { Directive } from '../directive.js';
import Vivere from '../../vivere.js';
import { Component } from '../../component.js';

export class ComponentDirective extends Directive {
  static name = 'v-component';
  static needsComponent = false;

  // Parsing

  parse() {
    // The previous component is now the parent
    const parent = this.component;

    // Instantiate the new component
    this.component = new Component(this.element, this.expression, parent);
    Vivere.components.push(this.component);
  }
};
