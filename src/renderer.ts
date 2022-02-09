import Directive from './directives/directive';
import Timer from './lib/timer';

let $dirty = false;

const $directives: Set<Directive> = new Set();
const $ticks: Set<() => void> = new Set();

const tick: () => void = () => {
  $ticks.forEach((t) => t());
  $ticks.clear();
};

const render: () => void = () => {
  Timer.time('Directives rendered', () => {
    $directives.forEach((d) => {
      // Delete this directive in case it gets
      // re-added during this render sequence
      $directives.delete(d);
      d.evaluate();
    });

    // Reset system so we're not waiting on anything
    $dirty = false;
  });

  // Run all waiting ticks
  tick();
};

const Renderer = {
  $forceRender(): void {
    render();
  },

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
