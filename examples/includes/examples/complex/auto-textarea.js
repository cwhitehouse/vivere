import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  announcement = 'The window resized!';

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
