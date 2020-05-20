import Directive from './directives/directive';

let $dirty = false;

const $directives: Set<Directive> = new Set();
const $ticks: Set<() => void> = new Set();

const tick: () => void = () => {
  $ticks.forEach((t) => t());
  $ticks.clear();
};

const render: () => void = () => {
  // Evaluate all directives queued for a render
  $directives.forEach((d) => d.evaluate());

  // Reset system so we're not waiting on anything
  $directives.clear();
  $dirty = false;

  // Run all waiting ticks
  tick();
};

const Renderer = {
  $queueRender(directive: Directive): void {
    // Add directives to set of directives that
    // will require an update next render
    $directives.add(directive);

    // Reqeust animation frame if we aren't
    // currently waiting on one
    if (!$dirty) {
      window.requestAnimationFrame(render);
      $dirty = true;
    }
  },

  $nextRender(func: () => void): void {
    $ticks.add(func);
  },
};

export default Renderer;
