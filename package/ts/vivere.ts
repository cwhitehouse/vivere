import Walk from './lib/walk';
import Component from './components/component';
import Registry from './reactivity/registry';
import { ComponentDefintion } from './components/definition';
import EventBus from './lib/events/bus';
import Event from './lib/events/event';
import Renderer from './renderer';

interface VivereInterface {
  $components?: Set<Component>;
  $definitions?: Registry<string, ComponentDefintion>;

  register: (name: string, definition: ComponentDefintion) => void;
  $track: (component: Component) => void;
  $untrack: (component: Component) => void;
  $getDefinition: (name: string) => ComponentDefintion;
}

declare global {
  interface Window {
    $vivere: VivereInterface;
  }
}

const $components: Set<Component> = new Set();
const $definitions: Registry<string, ComponentDefintion> = new Registry();

// Setup logic

const $setup = (element: Element): void => {
  // Walk the tree to initialize components
  Walk.tree(element);

  // Finalize connecting our components
  $components.forEach((c) => { c.$connect(); });
};

// Initialize Vivere

const $setupDocument = (): void => {
  $setup(document.body);

  // Stop listening to DOMContentLoaded
  document.removeEventListener('DOMContentLoaded', $setupDocument);
};
const $binding = $setupDocument.bind(this);


// Dehydrate Vivere

const dehydrate = (): void => {
  $components.forEach((c) => c.$dehydrate.call(c, true));
};


// SETUP VIVERE AUTOMATICALLY

// Listen for class DOM loaded event
document.addEventListener('DOMContentLoaded', $binding);

// Turbolinks listeners for compatibility
document.addEventListener('turbo:before-cache', () => {
  dehydrate();
});
document.addEventListener('turbo:before-render', (event: Record<string, any>) => {
  const { newBody } = event.detail;

  $setup(newBody);

  // Force an initial render on the main thread
  Renderer.$forceRender();
});

// For click.outside handlers, we need to see every click
document.addEventListener('click', (e: Event) => {
  EventBus.broadcast(Event.CLICK, e);
});


// Root logic

const Vivere: VivereInterface = {
  // Track components and definitions

  register(name: string, definition: ComponentDefintion): void {
    $definitions[name] = definition;
  },

  $track(component: Component): void {
    $components.add(component);
  },

  $untrack(component: Component): void {
    $components.delete(component);
  },

  $getDefinition(name: string): ComponentDefintion {
    if (name == null || name.length <= 0)
      return {};

    return $definitions[name];
  },
};

export default Vivere;
