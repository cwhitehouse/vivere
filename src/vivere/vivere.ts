import Polyfills from './lib/polyfills';
import Walk from './lib/walk';
import { Component } from './component';
import { Directive } from './directives/directive';
import { Registry } from './reactivity/registry';

let   $dirty:       Boolean         = false;

const $components:  Set<Component>      = new Set();
const $definitions: Registry<object>    = new Registry();
const $directives:  Set<Directive>      = new Set();
const $ticks:       Set<Function>       = new Set();

const tick = () => {
  $ticks.forEach(t => t());
  $ticks.clear();
};

const render = () => {
  // Evaluate all directives queued for a render
  $directives.forEach(d => d.evaluate());

  // Reset system so we're not waiting on anything
  $directives.clear();
  $dirty = false;

  // Run all waiting ticks
  tick();
};

const module = {
  // Track components and definitions

  register(name: string, definition: object) {
    $definitions[name] = definition;
  },

  $track(component: Component) {
    $components.add(component);
  },

  $untrack(component: Component) {
    $components.delete(component);
  },

  $getDefinition(name: string): object {
    return $definitions[name];
  },


  // Render management

  $queueRender(directive: Directive) {
    // Add directives to set of directives that
    // will require an update next frame
    $directives.add(directive);

    // Reqeust animation frame if we aren't
    // currently waiting on one
    if (!$dirty) {
      window.requestAnimationFrame(render);
      $dirty = true;
    }
  },

  $nextRender(func: Function) {
    $ticks.add(func);
  },


  // Initialization

  setup() {
    // Establish required Polyfills
    Polyfills.setup();

    // Walk the tree to initialize components
    Walk.tree(document.body);

    // Finalize connecting our components
    $components.forEach((c: Component) => c.$connect());
  },
};

export default module;
