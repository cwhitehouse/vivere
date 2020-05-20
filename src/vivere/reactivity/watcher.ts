export class Watcher {
  context:  any;
  callback: () => void;

  constructor(context: any, callback: () => void) {
    this.context = context;
    this.callback = callback;
  }


  // Singleton management

  static current?: Watcher;

  static assign(context: any, callback: () => void) {
    Watcher.current = new Watcher(context, callback);
  }

  static clear() {
    Watcher.current = null;
  }
}
