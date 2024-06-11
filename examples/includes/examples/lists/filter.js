import { Component } from "../../../../src/vivere";

export default class extends Component {
  items;
  toggleMode = 'all';

  get buttonLabel() {
    const { toggleMode } = this;

    if (toggleMode === 'even')
      return 'Even Items';

    if (toggleMode === 'odd')
      return 'Odd Items';

    return 'All Items';
  }

  get filteredItems() {
    const { items, toggleMode } = this;

    return items.filter((item) => {
      if (toggleMode === 'even')
        return item.id % 2 === 0;

      if (toggleMode === 'odd')
        return item.id % 2 !== 0;

      return true;
    });
  }

  toggleFilter() {
    const { toggleMode } = this;

    if (toggleMode === 'all')
      this.toggleMode = 'even';
    else if (toggleMode === 'even')
      this.toggleMode = 'odd';
    else
      this.toggleMode = 'all';
  }
}