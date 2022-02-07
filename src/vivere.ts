import Walk from './lib/walk';
import EventBus from './lib/events/bus';
import Event from './lib/events/event';
import Renderer from './renderer';
import VivereComponent from './components/vivere-component';
import ComponentRegistry from './components/registry';
import ComponentDefinitions from './components/definitions';
import Timer from './lib/timer';

// Setup logic

const $setup = (element: HTMLElement): void => {
  Timer.time('Document parsed', () => {
    // Walk the tree to initialize components
    Walk.element(element);

    // Finalize connecting our components
    ComponentRegistry.components.forEach((c) => { c.$connect(); });
  });
};

// Initialize Vivere

const $setupDocument = (): void => {
  $setup(document.body);

  // Stop listening to DOMContentLoaded
  document.removeEventListener('DOMContentLoaded', $setupDocument);
};

// Dehydrate Vivere

const dehydrate = (): void => {
  ComponentRegistry.components.forEach((c) => c.$dehydrate.call(c, true));
};

// SETUP VIVERE AUTOMATICALLY

// Listen for class DOM loaded event
document.addEventListener('DOMContentLoaded', $setupDocument);

// Turbolinks listeners for compatibility
document.addEventListener('turbo:before-cache', () => {
  dehydrate();
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const Vivere = {
  // Track components and definitions

  register(name: string, definition: (typeof VivereComponent)): void {
    ComponentDefinitions.register(name, definition);
  },
};

export { Vivere, VivereComponent };
