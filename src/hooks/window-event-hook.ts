import { Hook, VivereComponent } from '../vivere';

export default (component: VivereComponent, event: string, callback: () => void): Hook<void> => ({
  connected() {
    window.addEventListener(event, callback);
  },

  beforeDestroyed() {
    window.removeEventListener(event, callback);
  },
});
