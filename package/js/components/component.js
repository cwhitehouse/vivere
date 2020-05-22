import Utility from '../lib/utility';
import Vivere from '../vivere';
import Reactive from '../reactivity/reactive';
import Walk from '../lib/walk';
import Computed from '../reactivity/computed';
import Callbacks from './callbacks';
import Renderer from '../renderer';
import VivereError from '../error';
export default class Component {
    // Constructor
    constructor(element, name, parent) {
        // Load the component definition
        const componentName = Utility.pascalCase(name);
        const definition = Vivere.$getDefinition(componentName);
        if (definition == null)
            throw new VivereError(`Tried to instantiate unknown component ${componentName}`);
        // Initialize component data
        this.$bindings = {};
        this.$callbacks = new Callbacks(definition);
        this.$children = new Set();
        this.$computeds = new Set();
        this.$definition = definition;
        this.$directives = new Set();
        this.$dirty = false;
        this.$element = element;
        this.$name = componentName;
        this.$parent = parent;
        this.$passed = { ...definition.passed };
        this.$reactives = {};
        this.$refs = {};
        this.$watchers = { ...definition.watch };
        // Pass through methods
        Object.assign(this, { ...definition.methods });
        // Setup reactive data
        const { computed, data } = definition;
        if (data != null)
            Object.entries(data()).forEach(([k, v]) => this.$set(k, v));
        if (computed != null)
            Object.entries(computed).forEach(([k, v]) => Computed.set(this, k, v));
        // Attach the component to the DOM
        element.$component = this;
        // Track this component as a child of its parent
        parent?.$children.add(this);
    }
    // Reactivity
    $set(key, value) {
        // Turn on reactivity for properties
        const reactive = Reactive.set(this, key, value);
        // Listen for changes to this reactive property
        reactive.registerHook(this, () => this.$react(key));
    }
    $pass(key, reactive) {
        Reactive.pass(this, key, reactive);
    }
    $react(key) {
        // Invoke any watchers for this property
        this.$watchers[key]?.call(this);
    }
    // Event passing
    $emit(event, arg) {
        // Check bindings
        const method = this.$bindings[event];
        this.$parent[method](arg);
    }
    $invokeBinding(event, arg) {
        const method = this.$bindings[event];
        this[method](arg);
    }
    // Append DOM
    $attach(html, ref) {
        const element = this.$refs[ref];
        if (element == null)
            throw new VivereError(`No reference named ${ref} found`);
        const tempNode = document.createElement('div');
        tempNode.innerHTML = html;
        Object.values(tempNode.children).forEach((child) => {
            element.appendChild(child);
            Walk.tree(child, this);
        });
        // Force a render for children
        this.forceRender();
    }
    // Rendering
    $queueRender(directive) {
        Renderer.$queueRender(directive);
    }
    $nextRender(func) {
        Renderer.$nextRender(func);
    }
    forceRender(shallow = false) {
        this.$directives.forEach((d) => Renderer.$queueRender(d));
        if (!shallow)
            this.$children.forEach((child) => child.forceRender());
    }
    // Life cycle
    $connect() {
        // Callback hook
        this.$callbacks.beforeConnected?.call(this);
        // Force initial render
        this.forceRender(true);
        // Callback hook
        this.$callbacks.connected?.call(this);
    }
    $destroy() {
        // Callback hook
        this.$callbacks.beforeDestroyed?.call(this);
        // Destroy directives
        this.$directives.forEach((d) => d.destroy());
        // Destroy all children (recusive)
        this.$children.forEach((c) => c.$destroy());
        // Remove from parent's children
        this.$parent?.$children.delete(this);
        // Remove from global component registry
        Vivere.$untrack(this);
        // Remove from DOM
        this.$element.parentNode.removeChild(this.$element);
        // Callback hook
        this.$callbacks.destroyed?.call(this);
    }
}
