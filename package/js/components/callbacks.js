export default class Callbacks {
    constructor({ beforeConnected, connected, beforeDestroyed, destroyed, }) {
        // Track connect callbacks
        this.beforeConnected = beforeConnected;
        this.connected = connected;
        // Track disconnect callbacks
        this.beforeDestroyed = beforeDestroyed;
        this.destroyed = destroyed;
    }
}
