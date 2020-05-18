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
    if (this.constructor.name == null)
      throw 'Directives must be named';
    if (this.constructor.forComponent && !this.onComponent())
      throw `${name} only applies to components`;
    if (this.needsComponent && this.component == null)
      throw `${name} created without a component`;

    // Register directive on the component (if necessary)
    if (!this.constructor.forComponent)
      this.component?.$directives.push(this);

    // Finish parsing directive
    this.parse();
  }


  // Interface

  parse() {}
  evaluate() {}


  // Utiility methods

  onComponent() {
    // Check if component is registered to element
    return this.element.$vivere === this.component;
  }
};
