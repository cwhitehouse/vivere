import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  // ------------------------------------------------
  // DATA
  // ------------------------------------------------

  value;

  properties;

  // ------------------------------------------------
  // PASSED PROPERTIES
  // ------------------------------------------------

  $passed = {
    properties: { required: true },
  };

  // ------------------------------------------------
  // COMPUTED PROPERTIES
  // ------------------------------------------------

  get isSelected() {
    const { properties, value } = this;

    return properties != null
      && properties.includes(value);
  }

  get buttonClass() {
    const { isSelected } = this;

    if (isSelected) return ['button-emerald'];
    return [];
  }

  // ------------------------------------------------
  // HELPER METHODS
  // ------------------------------------------------

  toggleSelection() {
    const { properties, value } = this;

    const idx = properties.indexOf(value);
    if (idx >= 0)
      properties.splice(idx, 1);
    else
      properties.push(value);
  }
};