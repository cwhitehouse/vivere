import VivereError from '../error';
export default class Directive {
    // Constructor
    constructor(element, name, expression, component) {
        // Extract key from name
        const [, key] = name.split(':');
        // TODO: Extract modifiers from key
        this.component = component;
        this.element = element;
        this.key = key;
        this.expression = expression;
        // Check the directive if it's valid
        if (this.id() == null)
            throw new VivereError('Directives must have an identifier');
        if (this.forComponent() && !this.onComponent())
            throw new VivereError(`${name} only applies to components`);
        if (this.needsComponent() && this.component == null)
            throw new VivereError(`${name} created without a component`);
        // Register directive on the component (if necessary)
        if (!this.forComponent())
            this.component?.$directives.add(this);
        // Finish parsing directive
        this.parse();
        // Strip the attribute once it's been processed
        this.element.removeAttribute(name);
    }
    // Interface
    parse() {
        // Override to do additional directive parsing
        // - e.g. to validate the directive
    }
    evaluate() {
        // Override to render anything in DOM
        // - e.g. adding or removing a class
    }
    destroy() {
        // Override to tear down the directive
        // - e.g. remove event listeners
    }
    // Utiility methods
    id() {
        return this.constructor.id;
    }
    forComponent() {
        return this.constructor.forComponent;
    }
    needsComponent() {
        return this.constructor.needsComponent;
    }
    onComponent() {
        // Check if component is registered to element
        return this.element === this.component?.$element;
    }
}
