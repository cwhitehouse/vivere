import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  message;

  onMessageChanged() {
    console.log('Nested Container A detected a change to message...');
  }
}