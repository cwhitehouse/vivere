import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  message;

  $passed = {
    message: {
      default: null
    },
  }

  onMessageChanged() {
    console.log('Nested Container B detected a change to message...');
  }
}