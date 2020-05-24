export default class Watcher {
    constructor(context, callback) {
        this.context = context;
        this.callback = callback;
    }
    static watch(context, callback, watch) {
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
