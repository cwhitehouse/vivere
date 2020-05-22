import Component from '../components/component';
import VivereError from '../error';

export default class Directive {
  static id: string;
  static forComponent: boolean;
  static needsComponent: boolean;

  component?: Component;
  element: Element;
  expression: string;
  key?: string;

  // Constructor

  constructor(element: Element, name: string, expression: string, component?: Component) {
    // Extract key from name
    const [, key] = name.split(':');
    // TODO: Extract modifiers from key

    this.component = component;
    this.element = element;
    this.key = key;
    this.expression = expression;

    // Check the directive if it's valid
    if (this.id() == null) throw new VivereError('Directives must have an identifier');
    if (this.forComponent() && !this.onComponent()) throw new VivereError(`${name} only applies to components`);
    if (this.needsComponent() && this.component == null) throw new VivereError(`${name} created without a component`);

    // Register directive on the component (if necessary)
    if (!this.forComponent()) this.component?.$directives.add(this);

    // Finish parsing directive
    this.parse();

    // Strip the attribute once it's been processed
    this.element.removeAttribute(name);
  }


  // Interface

  parse(): void {
    // Override to do additional directive parsing
    // - e.g. to validate the directive
  }

  evaluate(): void {
    // Override to render anything in DOM
    // - e.g. adding or removing a class
  }

  destroy(): void {
    // Override to tear down the directive
    // - e.g. remove event listeners
  }


  // Utiility methods

  id(): string {
    return (this.constructor as typeof Directive).id;
  }

  forComponent(): boolean {
    return (this.constructor as typeof Directive).forComponent;
  }

  needsComponent(): boolean {
    return (this.constructor as typeof Directive).needsComponent;
  }

  onComponent(): boolean {
    // Check if component is registered to element
    return this.element === this.component?.$element;
  }
}
