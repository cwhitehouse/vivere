import { Component } from "../components/component";

export class Directive {
  static id:              string;
  static forComponent:    Boolean;
  static needsComponent:  Boolean;

  component?: Component;
  element:    Element;
  expression: string;
  key?:       string;

  // Constructor

  constructor(element: Element, name: string, expression: string, component?: Component) {
    // Extract key from name
    const [_, key] = name.split(':');
    // TODO: Extract modifiers from key

    this.component    = component;
    this.element      = element;
    this.key          = key;
    this.expression   = expression;

    // Check the directive if it's valid
    if (this.id() == null)
      throw 'Directives must have an identifier';
    if (this.forComponent() && !this.onComponent())
      throw `${name} only applies to components`;
    if (this.needsComponent() && this.component == null)
      throw `${name} created without a component`;

    // Register directive on the component (if necessary)
    if (!this.forComponent())
      this.component?.$directives.add(this);

    // Finish parsing directive
    this.parse();

    // Strip the attribute once it's been processed
    this.element.removeAttribute(name);
  }


  // Interface

  parse() {}
  evaluate() {}
  destroy() {}


  // Utiility methods

  id(): string {
    return (this.constructor as typeof Directive).id;
  }

  forComponent(): Boolean {
    return (this.constructor as typeof Directive).forComponent;
  }

  needsComponent(): Boolean {
    return (this.constructor as typeof Directive).needsComponent;
  }

  onComponent(): Boolean {
    // Check if component is registered to element
    return this.element === this.component?.$element;
  }
};
