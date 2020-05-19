import { Directive } from '../directive';
import Vivere from '../../vivere';
import { Component } from '../../component';

export class ComponentDirective extends Directive {
  static id: string               = 'v-component';
  static needsComponent: boolean  = false;


  // Parsing

  parse() {
    // The previous component is now the parent
    const parent = this.component;

    // Instantiate the new component
    this.component = new Component(this.element, this.expression, parent);
    Vivere.$track(this.component);
  }
};
