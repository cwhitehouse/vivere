import Directive from './directives/directive';

let $dirty = false;

const $directives: Set<Directive> = new Set();
const $ticks: Set<() => void> = new Set();

const tick: () => void = () => {
  $ticks.forEach((t) => t());
  $ticks.clear();
};

const render: () => void = () => {
  const start = performance.now();

  // Evaluate all directives queued for a render
  $directives.forEach((d) => d.evaluate());

  // Reset system so we're not waiting on anything
  $directives.clear();
  $dirty = false;

  const time = performance.now() - start;
  const method = time >= 100 ? 'warn' : 'log';
  // eslint-disable-next-line no-console
  console[method](`Vivere | Directives rendered: ${time}ms`);

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
