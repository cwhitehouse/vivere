import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  message;

  $passed = {
    message: {
      default: null
    },
  }
}