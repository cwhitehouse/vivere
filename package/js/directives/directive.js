import VivereError from '../error';
let Directive = /** @class */ (() => {
    class Directive {
        // Constructor
        constructor(element, name, expression, component) {
            // Extract key and modifiers from attribute name
            const [, ...key] = name.split(':');
            if (key != null)
                [this.key, ...this.modifiers] = key.join(':').split('.');
            this.component = component;
            this.element = element;
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
        // For turbolinks,
        dehydrate() {
            if (this.shouldRehydrate()) {
                let attributeName = this.id();
                if (this.key != null)
                    attributeName += `:${this.key}`;
                this.element.setAttribute(attributeName, this.expression);
            }
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
        shouldRehydrate() {
            return this.constructor.shouldRehydrate;
        }
    }
    Directive.shouldRehydrate = true;
    return Directive;
})();
export default Directive;
