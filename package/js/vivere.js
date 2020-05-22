import Walk from './lib/walk';
import Registry from './reactivity/registry';
const $components = new Set();
const $definitions = new Registry();
// Initialize Vivere
const $setup = () => {
    // Walk the tree to initialize components
    Walk.tree(document.body);
    // Finalize connecting our components
    $components.forEach((c) => c.$connect());
    // Remove our even listeners
    document.removeEventListener('DOMContentLoaded', $setup);
};
const $binding = $setup.bind(this);
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
        return $definitions[name];
    },
    // Initialization
    setup() {
        document.addEventListener('DOMContentLoaded', $binding);
    },
};
export default Vivere;
