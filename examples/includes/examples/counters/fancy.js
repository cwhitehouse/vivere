export default class {
  count = 0;

  stored = {
    count: {
      type: 'session',
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
}
