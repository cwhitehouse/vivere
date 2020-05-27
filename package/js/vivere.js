import Walk from './lib/walk';
import Registry from './reactivity/registry';
const $components = new Set();
const $definitions = new Registry();
let visitingTurbolinks = false;
// Initialize Vivere
const $setup = () => {
    // Walk the tree to initialize components
    Walk.tree(document.body);
    // Finalize connecting our components
    $components.forEach((c) => { c.$connect(); });
    // Stop listening to DOMContentLoaded
    document.removeEventListener('DOMContentLoaded', $setup);
};
const $binding = $setup.bind(this);
// Dehydrate Vivere
const dehydrate = () => {
    $components.forEach((c) => c.$dehydrate.call(c, true));
};
// Root logic
const Vivere = {
    // Track components and definitions
    register(name, definition) {
        $definitions[name] = definition;
    },
    $track(component) {
        $components.add(component);
    },
    $untrack(component) {
        $components.delete(component);
    },
    $getDefinition(name) {
        if (name == null || name.length <= 0)
            return {};
        return $definitions[name];
    },
    // Initialization
    setup() {
        // Listen for class DOM loaded event
        document.addEventListener('DOMContentLoaded', $binding);
        // Turbolinks listeners for compatibility
        document.addEventListener('turbolinks:before-cache', () => {
            dehydrate();
        });
        document.addEventListener('turbolinks:before-visit', () => {
            visitingTurbolinks = true;
        });
        document.addEventListener('turbolinks:load', () => {
            if (visitingTurbolinks)
                $binding();
        });
    },
};
export default Vivere;
