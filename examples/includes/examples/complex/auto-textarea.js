import { VivereComponent, WindowEventHook, RefEventHook } from "../../../../src/vivere";

export default class extends VivereComponent {
  announcement = 'The window resized!';

  beforeConnected() {
    console.log('AutoTextArea ## beforeConnected');
    this.$implements(WindowEventHook, 'resize', this.windowresize.bind(this));
    this.$implements(RefEventHook, 'textarea', 'input', this.resize.bind(this));
  }

  rendered() {
    const { $element } = this;
    $element.style.resize = 'none';
  }

  windowresize() {
    console.log(this.announcement);
  }

  resize() {
    const { $element } = this;
    if ($element instanceof HTMLElement) {
      $element.style.height = '0';
      $element.style.height = `${$element.scrollHeight}px`;
    }
  }
};
