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

  static assign(context: Directive | Computed, callback: () => void): void {
    Watcher.current = new Watcher(context, callback);
  }

  static clear(): void {
    Watcher.current = null;
  }
}
