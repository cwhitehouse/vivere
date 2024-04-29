import { EventBus, Hook, VivereComponent } from '../vivere';

export default (component: VivereComponent, event: string, callback: () => void): Hook<void> => ({
  connected() {
    EventBus.register(event, callback);
  },

  beforeDestroyed() {
    EventBus.deregister(event, callback);
  },
});
