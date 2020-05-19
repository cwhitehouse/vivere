export class Watcher {
  context:  any;
  callback: Function;

  constructor(context: any, callback: Function) {
    this.context = context;
    this.callback = callback;
  }


  // Singleton management

  static current?: Watcher;

  static assign(context: any, callback: Function) {
    Watcher.current = new Watcher(context, callback);
  }

  static clear() {
    Watcher.current = null;
  }
}
