import { Component } from '../../src/vivere';

export default class extends Component {
  exampleGroup = {};
  tags = [];

  activeTag = null;
  filterText = null;

  $passed = {
    filterTag: {},
    filterText: {},
  };

  get shouldShow() {
    const { exampleGroup, activeTag, filterText, tags } = this;
    const { description, name } = exampleGroup;

    const lowerText = filterText.toLowerCase();
    const lowerName = name.toLowerCase();
    const lowerDescription = description.toLowerCase();

    const matchesTag = !activeTag || tags.includes(activeTag);
    const matchesText =
      !filterText ||
      lowerName.includes(lowerText) ||
      lowerDescription.includes(lowerText);

    return matchesTag && matchesText;
  }
}
