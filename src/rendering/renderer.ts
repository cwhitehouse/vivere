import Directive from '../directives/directive';
import Timer from '../lib/timer';

let $dirty = false;

const $directives: Set<Directive> = new Set();
const $ticks: Set<() => void> = new Set();

const tick: () => void = () => {
  $ticks.forEach((t) => t());
  $ticks.clear();
};

const render: () => void = () => {
  Timer.time('Directives rendered :', () => {
    // New directives can be added to the set mid rendering, e.g. when
    // a v-for directive evaluates
    while ($directives.size) {
      // We want to be able to defer rendering of certain $directives, so convert what
      // we have into an array so they can be processed in order or deferred for later
      const directivesArray = Array.from($directives);

      // Start rendering directives, but we must ensure render controllers
      // are rendered first, so we will defer any directive rendering until
      // their render controller ancestor has finished rendering
      while (directivesArray.length) {
        const [directive] = directivesArray.splice(0, 1);

        // Only try to render if there's not relevant render controller ancestor, or
        // if that ancestor has already been rendered
        const { renderController } = directive;
        if (renderController == null || !renderController.$dirty) {
          directive.evaluate();
          $directives.delete(directive);
        }
      }
    }

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
