export default class Callbacks {
  beforeConnected:  Function;
  connected:        Function;

  beforeDestroyed:  Function;
  destroyed:        Function;

  constructor({ beforeConnected, connected, beforeDestroyed, destroyed }) {
    // Track connect callbacks
    this.beforeConnected = beforeConnected;
    this.connected = connected;

    // Track disconnect callbacks
    this.beforeDestroyed = beforeDestroyed;
    this.destroyed = destroyed;
  }
};
