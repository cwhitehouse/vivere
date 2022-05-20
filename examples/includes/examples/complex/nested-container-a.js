import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  communique = null;

  onCommuniqueChanged() {
    console.log('Nested Container A detected a change to communique...');
  }
}