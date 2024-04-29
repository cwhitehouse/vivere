import { Hook, VivereComponent } from '../vivere';

export default (component: VivereComponent, ref: string, event: string, callback: (...args: unknown[]) => void): Hook<void> => {
  let element: Element | null;

  return {
    rendered() {
      const $element = component.$refs[ref];
      if ($element instanceof Element) {
        element = $element;
        element.addEventListener(event, callback);
      }
    },

    beforeDestroyed() {
      element?.removeEventListener(event, callback);
    },
  };
};
