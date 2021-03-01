import Component from '../components/component';
import ComponentContext from '../components/component-context';
import VivereError from '../error';

export default class Directive {
  static id: string;
  static forComponent: boolean;
  static needsComponent: boolean;
  static shouldRehydrate = true;

  context?: ComponentContext;
  element: Element;
  expression: string;
  key?: string;
  modifiers?: string[];

  // Constructor

  constructor(element: Element, name: string, expression: string, context?: ComponentContext) {
    // Extract key and modifiers from attribute name
    const [, ...key] = name.split(':');
    if (key != null)
      [this.key, ...this.modifiers] = key.join(':').split('.');

    this.context = context;
    this.element = element;
    this.expression = expression;

    // Check the directive if it's valid
    if (this.id() == null) throw new VivereError('Directives must have an identifier');
    if (this.forComponent() && !this.onComponent()) throw new VivereError(`${name} only applies to components`);
    if (this.needsComponent() && this.context == null) throw new VivereError(`${name} created without a component`);

    // Register directive on the component (if necessary)
    if (this.context != null) this.context.directives.add(this);

    // Finish parsing directive
    this.parse();

    // Strip the attribute once it's been processed
    this.element.removeAttribute(name);
  }


  // Component

  get component(): Component {
    const { context } = this;

    if (context != null) return context.component;
    return null;
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

  needsComponent(): boolean {
    return (this.constructor as typeof Directive).needsComponent;
  }

  onComponent(): boolean {
    // Check if component is registered to element
    return this.context != null && this.element === this.context.element;
  }

  shouldRehydrate(): boolean {
    return (this.constructor as typeof Directive).shouldRehydrate;
  }
}