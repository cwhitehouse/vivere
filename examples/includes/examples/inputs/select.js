import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  $stored = {
    value: {
      type: 'session',
      default: 'london',
    },
  };

  reset() {
    this.value = 'rome';
  }
}