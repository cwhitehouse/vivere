import Walk from './lib/walk';
import Component from './components/component';
import Registry from './reactivity/registry';
import { ComponentDefintion } from './components/definition';

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

const $setup = (): void => {
  // Walk the tree to initialize components
  Walk.tree(document.body);

  // Finalize connecting our components
  $components.forEach((c: Component) => c.$connect());

  // Expose the system during development
  if (process.env.NODE_ENV === 'development') {
    Vivere.$components = $components;
    Vivere.$definitions = $definitions;

    window.$vivere = Vivere;
  }

  // Remove our even listeners
  document.removeEventListener('DOMContentLoaded', $setup);
};

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
    return $definitions[name];
  },


  // Initialization

  setup(): void {
    document.addEventListener('DOMContentLoaded', $setup);
  },
};

export default Vivere;
