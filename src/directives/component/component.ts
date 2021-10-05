import Directive from '../directive';
import Utility from '../../lib/utility';
import VivereError from '../../errors/error';
import ComponentRegistry from '../../components/registry';
import ComponentDefinitions from '../../components/definitions';

export default class ComponentDirective extends Directive {
  static id = 'v-component';

  static needsComponent = false;

  // Parsing

  parse(): void {
    // The previous component is now the parent
    const parent = this.component;

    // Instantiate the new component
    const componentName = Utility.pascalCase(this.expression);
    const Definition = ComponentDefinitions.getDefinition(componentName);

    if (Definition == null)
      throw new VivereError(`Tried to instantiate unknown component ${componentName}`);

    this.component = new Definition(componentName, this.element, parent);
    this.component.$setupReactivity();
    this.component.$directives.add(this);

    // Add this component to the global registry
    ComponentRegistry.track(this.component);
  }
}
