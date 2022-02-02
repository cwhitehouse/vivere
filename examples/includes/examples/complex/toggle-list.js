import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  // ------------------------------------------------
  // DATA
  // ------------------------------------------------

  properties;

  // ------------------------------------------------
  // COMPUTED PROPERTIES
  // ------------------------------------------------

  get propertiesString() {
    const { properties } = this;
    return properties.join(' ,  ');
  }
};