import { CallbacksInterface } from './definition/callbacks-interface';

export default class Callbacks implements CallbacksInterface {
  beforeConnected: () => void;
  connected: () => void;
  beforeDestroyed: () => void;
  destroyed: () => void;

  constructor({
    beforeConnected, connected, beforeDestroyed, destroyed,
  }) {
    // Track connect callbacks
    this.beforeConnected = beforeConnected;
    this.connected = connected;

    // Track disconnect callbacks
    this.beforeDestroyed = beforeDestroyed;
    this.destroyed = destroyed;
  }
}
