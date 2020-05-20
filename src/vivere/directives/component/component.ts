import Directive from '../directive';
import Vivere from '../../vivere';
import Component from '../../components/component';

export default class ComponentDirective extends Directive {
  static id = 'v-component';
  static needsComponent = false;

  // Parsing

  parse(): void {
    // The previous component is now the parent
    const parent = this.component;

    // Instantiate the new component
    this.component = new Component(this.element, this.expression, parent);
    Vivere.$track(this.component);
  }
}
