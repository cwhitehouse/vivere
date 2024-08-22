import { Component } from '../../../../src/vivere';

export default class extends Component {
  items;
  shuffledItems = [];

  toggleMode = 'all';

  get buttonLabel() {
    const { toggleMode } = this;

    if (toggleMode === 'even') return 'Even Items';

    if (toggleMode === 'odd') return 'Odd Items';

    return 'All Items';
  }

  get filteredItems() {
    const { shuffledItems, toggleMode } = this;

    return shuffledItems.filter(item => {
      if (toggleMode === 'even') return item.id % 2 === 0;

      if (toggleMode === 'odd') return item.id % 2 !== 0;

      return true;
    });
  }

  connected() {
    const { items, shuffledItems } = this;

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      shuffledItems.push(item);
    }
  }

  toggleFilter() {
    const { toggleMode } = this;

    if (toggleMode === 'all') this.toggleMode = 'even';
    else if (toggleMode === 'even') this.toggleMode = 'odd';
    else this.toggleMode = 'all';
  }

  shuffleItems() {
    this.shuffledItems = this.shuffle(this.items);
  }

  shuffle(array) {
    const copy = [...array];
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [copy[currentIndex], copy[randomIndex]] = [
        copy[randomIndex],
        copy[currentIndex],
      ];
    }

    return copy;
  }
}
