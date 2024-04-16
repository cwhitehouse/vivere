import Directive from '../directive';
import Utility from '../../lib/utility';
import VivereError from '../../errors/error';
import ComponentRegistry from '../../components/registry';
import ComponentDefinitions from '../../components/definitions';
import Walk from '../../lib/walk';

export default class ComponentDirective extends Directive {
  static id = 'v-component';

  static needsComponent = false;

  binding: (event: Event) => boolean;

  parsingComplete = false;

  // Parsing

  parse(): void {
    const { component, element, expression, key, logicalAncestor, modifiers } = this;

    // The previous component is now the parent
    const parent = component;

    // Instantiate the new component
    const componentName = Utility.pascalCase(expression);
    const Definition = ComponentDefinitions.getDefinition(componentName);

    if (Definition == null)
      throw new VivereError(`Tried to instantiate unknown component ${componentName}`);

    this.component = new Definition(componentName, element, parent, logicalAncestor);
    this.component.$directives.add(this);

    // Handle hydration unless we're defering loading
    if (key === 'defer') {
      // Suspend parsing, we don't need to process any
      // more directives until we see a reason to
      this.suspendParsing();

      // Bind our method for completing parsing
      this.binding = this.completeParsing.bind(this);

      // Attach the event listener so any actions force rendering to finish
      modifiers?.forEach((event) => {
        element.addEventListener(event, this.binding, true);
      });
    } else {
      this.parsingComplete = true;

      // Add this component to the global registry
      ComponentRegistry.track(this.component);

      // Hydrate reactive data
      this.hydrate();
    }
  }

  // Hydration

  hydrate(): void {
    const { component } = this;
    component.$setupReactivity();
  }

  completeParsing(): boolean {
    if (this.parsingComplete) return true;
    this.parsingComplete = true;

    // Add this component to the global registry
    ComponentRegistry.track(this.component);

    // Resume parsing, hydrate the data, finish parsing, and render
    this.resumeParsing();
    this.hydrate();
    Walk.tree(this.element, this.component, this.component?.$logicalAncestor);
    this.component.$forceRender();

    // Remove our event listener
    this.removeDeferedEventListener();

    // Let the event keep propogating
    return true;
  }

  removeDeferedEventListener(): void {
    const { binding, element, modifiers } = this;

    if (binding != null)
      modifiers?.forEach((event) => {
        element.removeEventListener(event, binding, true);
      });
  }

  // Dehydration

  dehydrate(): void {
    this.removeDeferedEventListener();
    super.dehydrate();
  }
}
