import { VivereComponent } from "../../src/vivere";

export default class extends VivereComponent {
  exampleGroup = {};
  tags = [];

  filterTag = null;
  filterText = null;

  $passed = {
    filterTag: {},
    filterText: {},
  }

  get shouldShow() {
    const { exampleGroup, filterTag, filterText, tags } = this;
    const { description, name } = exampleGroup;

    const lowerText = filterText.toLowerCase();
    const lowerName = name.toLowerCase();
    const lowerDescription = description.toLowerCase();

    const matchesTag = !filterTag ||
      tags.includes(filterTag);
    const matchesText = !filterText ||
      lowerName.includes(lowerText) ||
      lowerDescription.includes(lowerText);

    return matchesTag && matchesText;
  }
};
