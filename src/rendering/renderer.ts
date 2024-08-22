import ConditionalDirective from '../directives/display/conditional';
import DisplayDirective from '../directives/display/display';
import ForDirective from '../directives/display/for';
import SyncDirective from '../directives/display/sync';
import Timer from '../lib/timer';

let $dirty = false;

const $primaryDirectives: Set<DisplayDirective> = new Set();
const $directives: Set<DisplayDirective> = new Set();
const $delayedDirectives: Set<DisplayDirective> = new Set();

const $ticks: Set<() => void> = new Set();

const tick: () => void = () => {
  $ticks.forEach(t => t());
  $ticks.clear();
};

const render: (shouldTick: boolean) => void = (shouldTick = true) => {
  Timer.time('Directives rendered :', () => {
    // New directives can be added to the set mid rendering, e.g. when
    // a v-for directive evaluates, so we need to be careful about our rendering order
    //
    // Ensure we don't finish rendering while any directives are still
    // queued up to be rendered
    while (
      $primaryDirectives.size ||
      $directives.size ||
      $delayedDirectives.size
    )
      // Try to render in the best order possible
      [$primaryDirectives, $directives, $delayedDirectives].forEach(
        directives => {
          // Until this set is empty, keep iterating
          while (directives.size) {
            // We want to be able to defer rendering of certain $directives, so convert what
            // we have into an array so they can be processed in order or deferred for later
            const directivesArray = Array.from(directives);

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
                directives.delete(directive);
              }
            }
          }
        },
      );

    // Reset system so we're not waiting on anything
    $dirty = false;
  });

  if (shouldTick)
    // Run all waiting ticks
    tick();
};

const renderAndTick = () => {
  render(true);
};

const Renderer = {
  $forceTick(): void {
    tick();
  },

  $forceRender(shouldTick = true): void {
    render(shouldTick);
  },

  $queueRender(directive: DisplayDirective): void {
    // Add directives to set of directives that
    // will require an update next render
    if (
      directive instanceof ForDirective ||
      directive instanceof ConditionalDirective
    )
      $primaryDirectives.add(directive);
    else if (directive instanceof SyncDirective)
      $delayedDirectives.add(directive);
    else $directives.add(directive);

    // Reqeust animation frame if we aren't
    // currently waiting on one
    if (!$dirty) {
      window.requestAnimationFrame(renderAndTick);
      $dirty = true;
    }
  },

  $nextRender(func: () => void): void {
    $ticks.add(func);
  },
};

export default Renderer;
