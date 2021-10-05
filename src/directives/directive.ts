import DirectiveError from '../errors/directive-error';
import VivereComponent from '../components/vivere-component';

export default class Directive {
  static id: string;

  static forComponent: boolean;

  static requiresComponent: boolean;

  static requiresKey = false;

  static shouldRehydrate = true;

  component?: VivereComponent;

  element: Element;

  expression: string;

  key?: string;

  modifiers?: string[];

  // Constructor

  constructor(element: Element, name: string, expression: string, component?: VivereComponent) {
    this.component = component;
    this.element = element;
    this.expression = expression;

    // Extract key and modifiers from attribute name
    const [, ...key] = name.split(':');

    if (key)
      [this.key, ...this.modifiers] = key.join(':').split('.');

    if (!this.key && this.requiresKey())
      throw new DirectiveError(`A key is required for ${this.id()} directives`, this);

    // Check the directive if it's valid
    if (this.id() == null) throw new DirectiveError('Directives must have an identifier', this);
    if (this.forComponent() && !this.onComponent()) throw new DirectiveError(`${name} only applies to component roots`, this);
    if (this.requiresComponent() && this.component == null) throw new DirectiveError(`${name} requires a component`, this);

    // Register directive on the component (if necessary)
    if (this.component != null) this.component.$directives.add(this);

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

  // For turbolinks,

  dehydrate(): void {
    if (this.shouldRehydrate()) {
      let attributeName = this.id();
      if (this.key)
        attributeName += `:${this.key}`;

      if (this.modifiers && this.modifiers.length)
        attributeName += `.${this.modifiers.join('.')}`;

      this.element.setAttribute(attributeName, this.expression);
    }
  }

  // Utiility methods

  id(): string {
    return (this.constructor as typeof Directive).id;
  }

  forComponent(): boolean {
    return (this.constructor as typeof Directive).forComponent;
  }

  requiresComponent(): boolean {
    return (this.constructor as typeof Directive).requiresComponent;
  }

  requiresKey(): boolean {
    return (this.constructor as typeof Directive).requiresKey;
  }

  onComponent(): boolean {
    // Check if component is registered to element
    return this.component != null && this.element === this.component.$element;
  }

  shouldRehydrate(): boolean {
    return (this.constructor as typeof Directive).shouldRehydrate;
  }
}
