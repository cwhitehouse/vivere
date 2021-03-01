import Directive from '../directive';
import { Vivere } from '../../vivere';
import ComponentContext from '../../components/component-context';

export default class ComponentDirective extends Directive {
  static id = 'v-component';
  static needsComponent = false;

  // Parsing

  parse(): void {
    // The previous component is now the parent
    const parent = this.context;

    // Instantiate the new component
    this.context = new ComponentContext(this.element, this.expression, parent);
    this.context.directives.add(this);

    // Add this component to the global registry
    Vivere.$track(this.context);
  }
}
