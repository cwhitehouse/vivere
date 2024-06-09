import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  label = null;

  get hasLabel() {
    return this.label != null
      && this.label.length > 0;
  }

  onShowingChanged() {
    if (this.showing)
      this.$nextRender(() => this.$refs.input.focus());
  }

  reset() {
  this.close();
  }

  create() {
    if (this.hasLabel)
      this.$parent.create(this.label);
    this.close();
  }

  close() {
    this.cancel();
    this.label = null;
  }
};
