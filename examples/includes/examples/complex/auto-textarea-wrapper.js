import { Component } from "../../../../src/vivere";

export default class extends Component {
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
