import Walk from './lib/walk';
import Registry from './reactivity/registry';
import EventBus from './lib/events/bus';
import Event from './lib/events/event';
import Renderer from './renderer';
const $components = new Set();
const $definitions = new Registry();
// Setup logic
const $setup = (element) => {
    const start = new Date();
    // Walk the tree to initialize components
    Walk.tree(element);
    // Finalize connecting our components
    $components.forEach((c) => { c.$connect(); });
    console.log(`Vivere | Document parsed: ${new Date().getTime() - start.getTime()}ms`);
};
// Initialize Vivere
const $setupDocument = () => {
    $setup(document.body);
    // Stop listening to DOMContentLoaded
    document.removeEventListener('DOMContentLoaded', $setupDocument);
};
const $binding = $setupDocument.bind(this);
// Dehydrate Vivere
const dehydrate = () => {
    $components.forEach((c) => c.$dehydrate.call(c, true));
};
// SETUP VIVERE AUTOMATICALLY
// Listen for class DOM loaded event
document.addEventListener('DOMContentLoaded', $binding);
// Turbolinks listeners for compatibility
document.addEventListener('turbo:before-cache', () => {
    dehydrate();
});
document.addEventListener('turbo:before-render', (event) => {
    const { newBody } = event.detail;
    $setup(newBody);
    // Force an initial render on the main thread
    Renderer.$forceRender();
});
// For click.outside handlers, we need to see every click
document.addEventListener('click', (e) => {
    EventBus.broadcast(Event.CLICK, e);
});
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
};
export default Vivere;
