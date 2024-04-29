import { Hook, VivereComponent } from '../vivere';

export default (component: VivereComponent, event: string, callback: () => void): Hook<void> => ({
  connected() {
    document.addEventListener(event, callback);
  },

  beforeDestroyed() {
    document.removeEventListener(event, callback);
  },
});
