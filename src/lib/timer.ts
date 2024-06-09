import { Vivere } from '../vivere';

export default {
  time(message: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const time = performance.now() - start;

    let method: string;
    if (time >= 100)
      method = 'warn';
    else
      method = 'log';

    if (Vivere.options.profiling)
      // eslint-disable-next-line no-console
      console[method](`Vivere | ${message}: ${time.toFixed(2)}ms`);
  },
};
