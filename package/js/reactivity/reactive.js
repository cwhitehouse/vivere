import Watcher from './watcher';
import Registry from './registry';
import ReactiveArray from './array';
import ReactiveObject from './object';
import VivereError from '../error';
export default class Reactive {
    constructor(value) {
        this.registry = new Registry();
        this.updateValue(value);
    }
    // Accessing the value, and tracking updates
    getValue() {
        return this.value;
    }
    get() {
        const watcher = Watcher.current;
        if (watcher != null) {
            const { context, callback } = watcher;
            this.registerHook(context, callback);
        }
        return this.getValue();
    }
    // Assigning values, and reacting
    set(value) {
        if (value !== this.value) {
            this.updateValue(value);
            this.report();
        }
    }
    updateValue(value) {
        this.value = this.reactiveValue(value);
    }
    reactiveValue(value) {
        if (value == null)
            return null;
        if (value instanceof Array)
            return new ReactiveArray(value, this);
        if (typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => Reactive.set(value, k, v));
            return new ReactiveObject(value);
        }
        return value;
    }
    // Reporting
    registerHook(object, hook) {
        this.registry.register(object, hook);
    }
    report() {
        this.registry.forEach((_, hook) => hook());
    }
    // Helper method for automatically making a property reactive
    static set(host, key, value) {
        const $host = host;
        // Ensure $reactives property exists
        if ($host.$reactives == null)
            $host.$reactives = {};
        // Check if we've already set up reactivity
        // for this property and component
        let reactive = $host.$reactives[key];
        if (reactive == null) {
            // Initialize a Reactive object
            reactive = new Reactive(value);
            // Track the reactive object on the host
            $host.$reactives[key] = reactive;
            // Override property definitions
            Object.defineProperty($host, key, {
                get() { return $host.$reactives[key]?.get(); },
                set(newValue) { $host.$reactives[key].set(newValue); },
            });
        }
        else
            // Simple assignment is sufficient
            host[key] = value;
        return reactive;
    }
    // Helper method for tracking passed properties
    static pass(component, key, reactive) {
        // Track the Reactive on the Passed info
        const passed = component.$passed[key];
        passed.$reactive = reactive;
        // Pass down Reactive property
        Object.defineProperty(component, key, {
            get() {
                if (passed == null)
                    throw new VivereError(`Value passed to component for unknown key ${key}`);
                let value = reactive.get();
                if (value == null) {
                    if (passed.required)
                        throw new VivereError(`${key} is required to be passed`);
                    value = passed.default;
                }
                return value;
            },
            set() {
                throw new VivereError('Cannot update passed values from a child');
            },
        });
        // Invoke once to ensure Watcher is initialized
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        component[key];
    }
    // Better JSON rendering
    toJSON() {
        return JSON.stringify(this.value);
    }
}
