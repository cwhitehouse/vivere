export default class Callbacks {
    constructor({ beforeConnected, connected, beforeDestroyed, destroyed, beforeDehydrated, dehydrated, }) {
        // Track connect callbacks
        this.beforeConnected = beforeConnected;
        this.connected = connected;
        // Track disconnect callbacks
        this.beforeDestroyed = beforeDestroyed;
        this.destroyed = destroyed;
        // Track dehydrate callbacks
        this.beforeDehydrated = beforeDehydrated;
        this.dehydrated = dehydrated;
    }
}
