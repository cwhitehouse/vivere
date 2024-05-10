import { VivereComponent, WindowEventHook, RefEventHook } from "../../../../src/vivere";

export default class extends VivereComponent {
  announcement = 'The window resized!';

  beforeConnected() {
    console.log('AutoTextArea ## beforeConnected');
    this.$implements(WindowEventHook, { event: 'resize', callback: this.resize });
    this.$implements(RefEventHook, { ref: 'textarea', event: 'input', callback: this.resize });
  }

  rendered() {
    const { $element } = this;
    $element.style.resize = 'none';
  }

  resize() {
    const { $element } = this;
    if ($element instanceof HTMLElement) {
      $element.style.height = '0';
      $element.style.height = `${$element.scrollHeight}px`;
    }
  }
};
