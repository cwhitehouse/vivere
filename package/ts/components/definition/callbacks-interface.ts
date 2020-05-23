export interface CallbacksInterface {
  beforeConnected: () => void;
  connected: () => void;

  beforeDestroyed: () => void;
  destroyed: () => void;

  beforeDehydrated: () => void;
  dehydrated: () => void;
}
