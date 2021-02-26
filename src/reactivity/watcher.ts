import Directive from '../directives/directive';
import Computed from './computed';

export default class Watcher {
  context: Directive | Computed;
  callback: () => void;

  constructor(context: Directive | Computed, callback: () => void) {
    this.context = context;
    this.callback = callback;
  }


  // Singleton management

  static current?: Watcher;

  static watch(context: Directive | Computed, callback: () => void, watch: () => void): void {
    // Save current Watcher
    const { current } = Watcher;

    // Set up new Watcher
    Watcher.current = new Watcher(context, callback);

    // Execute method that needs to be watched
    watch();

    // Re-assign current watcher
    Watcher.current = current;
  }
}
