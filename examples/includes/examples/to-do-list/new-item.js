import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  label = null;

  $passed = {
    showing: {
      type: Boolean,
      default: true,
    },
  };

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
      this.$emit('create', this.label);
    this.close();
  }

  close() {
    this.$emit('cancel');
    this.label = null;
  }
};
