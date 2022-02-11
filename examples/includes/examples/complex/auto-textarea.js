import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  $resizeBinding = null;

  connected() {
    this.$resizeBinding = this.resize.bind(this);

    this.$nextRender(() => {
      const { $element } = this;

      $element.style.resize = 'none';

      $element.addEventListener('input', this.$resizeBinding);

      this.resize();
    });
  }

  resize() {
    const { $element } = this;
    if ($element instanceof HTMLElement) {
      $element.style.height = '0';
      $element.style.height = `${$element.scrollHeight}px`;
    }
  }
};
