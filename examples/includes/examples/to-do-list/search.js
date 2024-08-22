import { Component } from '../../../../src/vivere';

export default class extends Component {
  filtering = false;

  $passed = {
    filtering: {
      type: Boolean,
    },
    text: {
      type: String,
    },
  };

  clear() {
    this.text = null;
    this.blur();
  }

  blur() {
    this.$refs.input.blur();
  }
}
