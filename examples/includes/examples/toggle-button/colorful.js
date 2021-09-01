export default class {
  on = false;

  get buttonText() {
    const { on } = this;

    if (on) return 'On';
    else return 'Off';
  }

  get buttonClass() {
    const { on } = this;

    if (on) return ['bg-cyan-100', 'text-cyan-800'];
    else return ['bg-pink-100', 'text-pink-800'];
  }
}
