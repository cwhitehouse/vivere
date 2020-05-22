export default class Watcher {
    constructor(context, callback) {
        this.context = context;
        this.callback = callback;
    }
    static assign(context, callback) {
        Watcher.current = new Watcher(context, callback);
    }
    static clear() {
        Watcher.current = null;
    }
}
