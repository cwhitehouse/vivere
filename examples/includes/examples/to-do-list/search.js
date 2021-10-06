import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  inputText = null;

  filtering = false;
  text = null;

  $passed = {
    filtering: {
      type: Boolean,
    },
    text: {
      type: String,
    },
  };

  onInputTextChanged() {
    this.$emit('input', this.inputText);
  }

  onTextChanged() {
    this.inputText = this.text;
  }

  clear() {
    this.inputText = null;
    this.blur();
  }

  blur() {
    this.$refs.input.blur();
  }
};
