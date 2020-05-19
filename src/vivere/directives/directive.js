export class Directive {
  static needsComponent = true;
  static forComponent = false;

  // Constructor

  constructor(element, name, expression, component) {
    // Extract key from name
    const [_, key] = name.split(':');
    // TODO: Extract modifiers from key

    Object.assign(this, {
      element,
      component,
      key,
      expression,
    });

    // Check the directive if it's valid
    if (this.name() == null)
      throw 'Directives must be named';
    if (this.forComponent() && !this.onComponent())
      throw `${name} only applies to components`;
    if (this.needsComponent && this.component == null)
      throw `${name} created without a component`;

    // Register directive on the component (if necessary)
    if (!this.forComponent())
      this.component?.$directives.push(this);

    // Finish parsing directive
    this.parse();

    // Strip the attribute once it's been processed
    this.element.removeAttribute(name);
  }


  // Interface

  parse() {}
  evaluate() {}


  // Utiility methods

  name() {
    return this.constructor.name;
  }

  forComponent() {
    return this.constructor.forComponent;
  }

  onComponent() {
    // Check if component is registered to element
    return this.element.$component === this.component;
  }
};
