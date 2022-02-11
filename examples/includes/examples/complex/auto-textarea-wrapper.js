import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  name = null;

  $defaultName = 'Christian Whitehouse';

  connected() {
    this.$nextRender(() => {
      this.resetName();
    });
  }

  resetName() {
    this.name = this.$defaultName;
  }
};
