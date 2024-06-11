import { Component } from "../../../../src/vivere";

export default class extends Component {
  count = 0;

  $stored = {
    count: {
      type: 'session',
      modifier: 'fancy-counter',
    },
  };

  get countHigh() {
    const { count } = this;
    return count >= 5;
  }

  get logMessage() {
    const { countHigh } = this;

    if (countHigh) return '< THE COUNT IS NOW HIGH! >';
    return '> THE COUNT IS NOW LOW <';
  }

  get canDecrement() {
    const { count } = this;
    return count > 0;
  }

  onCountHighChanged() {
    const { logMessage } = this;
    console.log(logMessage);
  }

  incrementCount() {
    this.count += 1;
  }

  decrementCount() {
    const { canDecrement } = this;

    if (canDecrement)
      this.count -= 1;
  }
}
