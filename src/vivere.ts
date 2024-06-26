import Walk from './lib/walk';
import Renderer from './rendering/renderer';
import VivereComponent from './components/vivere-component';
import ComponentRegistry from './components/registry';
import ComponentDefinitions from './components/definitions';
import Timer from './lib/timer';
import { VivereHook } from './hooks/vivere-hook';
import WindowEventHook from './hooks/window-event-hook';
import DocumentEventHook from './hooks/document-event-hook';
import RefEventHook from './hooks/ref-event-hook';

// Configuration Options

const DEFAULT_ANIMATION_DURATION = 150;

interface VivereConfiguration {
  animationDuration: number,
  profiling: boolean,
  suppressErrors: boolean,
  logErrors: boolean,
}
interface VivereOptions {
  animationDuration?: number,
  profiling?: boolean,
  suppressErrors?: boolean,
  logErrors?: boolean,
}
let configurationOptions: VivereConfiguration = {
  animationDuration: DEFAULT_ANIMATION_DURATION,
  profiling: true,
  suppressErrors: false,
  logErrors: false,
};

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

  // Force an initial render on the main thread (but don't tick!)
  // - Want the DOM to be in the correct state before turbo has rendered the new DOM
  // - But things waiting for rendering should wait until turbo has rendered the new DOM
  // - Our ticks will be invoked when `requestAnimationFrame` resolves
  Renderer.$forceRender(false);
});

// Root logic

const Vivere = {
  // Track components and definitions

  register(name: string, definition: (typeof VivereComponent)): void {
    ComponentDefinitions.register(name, definition);
  },

  // Options

  DEFAULT_ANIMATION_DURATION,

  getOptions(): VivereConfiguration {
    return configurationOptions;
  },

  setOptions(options: VivereOptions): void {
    configurationOptions = {
      ...configurationOptions,
      ...options,
    };
  },
};

export { Vivere, VivereComponent, VivereHook, WindowEventHook, DocumentEventHook, RefEventHook };
