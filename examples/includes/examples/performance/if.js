import { Component } from "../../../../src/vivere";

export default class extends Component {
  count = 0;
  modal = false;

  connected() {
    this.$log('VIf Component connected!');
  }
}
