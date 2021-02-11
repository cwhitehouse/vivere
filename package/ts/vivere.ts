import Walk from './lib/walk';
import Component from './components/component';
import Registry from './reactivity/registry';
import { ComponentDefintion } from './components/definition';
import EventBus from './lib/events/bus';
import Event from './lib/events/event';

interface VivereInterface {
  $components?: Set<Component>;
  $definitions?: Registry<string, ComponentDefintion>;

  register: (name: string, definition: ComponentDefintion) => void;
  $track: (component: Component) => void;
  $untrack: (component: Component) => void;
  $getDefinition: (name: string) => ComponentDefintion;
  setup: () => void;
}

declare global {
  interface Window {
    $vivere: VivereInterface;
  }
}

const $components: Set<Component> = new Set();
const $definitions: Registry<string, ComponentDefintion> = new Registry();

let visitingTurbolinks = false;


// Initialize Vivere

const $setup = (): void => {
  // Walk the tree to initialize components
  Walk.tree(document.body);

  // Finalize connecting our components
  $components.forEach((c) => { c.$connect(); });

  // Stop listening to DOMContentLoaded
  document.removeEventListener('DOMContentLoaded', $setup);
};
const $binding = $setup.bind(this);


// Dehydrate Vivere

const dehydrate = (): void => {
  $components.forEach((c) => c.$dehydrate.call(c, true));
};


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


  // Initialization

  setup(): void {
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

    // For click.outside handlers, we need to see every click
    document.addEventListener('click', (e: Event) => {
      EventBus.broadcast(Event.CLICK, e);
    });
  },
};

export default Vivere;
