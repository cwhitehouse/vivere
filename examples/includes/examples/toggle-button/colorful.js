import { Component } from "../../../../src/vivere";

export default class extends Component {
  on = false;

  get buttonText() {
    const { on } = this;

    if (on) return 'On';
    else return 'Off';
  }

  get buttonClass() {
    const { on } = this;

    if (on) return ['bg-cyan-100'];
    else return ['bg-pink-100'];
  }
}
