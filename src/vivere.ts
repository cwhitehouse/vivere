import Walk from './lib/walk';
import ComponentContext from './components/component-context';
import Registry from './reactivity/registry';
import ComponentInterface from './components/interface';
import EventBus from './lib/events/bus';
import Event from './lib/events/event';
import Renderer from './renderer';
import Component from './components/component';

interface VivereInterface {
  $components?: Set<ComponentContext>;
  $definitions?: Registry<string, ComponentInterface>;

  register: (name: string, definition: typeof Component) => void;
  $track: (component: ComponentContext) => void;
  $untrack: (component: ComponentContext) => void;
  $getDefinition: (name: string) => typeof Component;
}

declare global {
  interface Window {
    $vivere: VivereInterface;
  }
}

const $components: Set<ComponentContext> = new Set();
const $definitions: Registry<string, typeof Component> = new Registry();

// Setup logic

const $setup = (element: Element): void => {
  const start = new Date();

  // Walk the tree to initialize components
  Walk.tree(element);

  // Finalize connecting our components
  $components.forEach((c) => { c.connect(); });

  console.log(`Vivere | Document parsed: ${new Date().getTime() - start.getTime()}ms`);
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
  $components.forEach((c) => c.dehydrate.call(c, true));
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

  register(name: string, definition: typeof Component): void {
    $definitions.register(name, definition);
  },

  $track(component: ComponentContext): void {
    $components.add(component);
  },

  $untrack(component: ComponentContext): void {
    $components.delete(component);
  },

  $getDefinition(name: string): typeof Component {
    if (name == null || name.length <= 0)
      return Component;

    return $definitions.get(name);
  },
};

export { Vivere, Component as VivereComponent, ComponentInterface };
