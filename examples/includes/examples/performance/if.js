import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  count = 0;
  modal = false;

  connected() {
    console.log('VIf Component connected!');
  }
}
