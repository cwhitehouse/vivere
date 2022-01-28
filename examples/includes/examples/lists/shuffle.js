import { VivereComponent } from "../../../../src/vivere";

export default class extends VivereComponent {
  items;
  shuffledItems = [];

  connected() {
    const { items, shuffledItems } = this;

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      shuffledItems.push(item);
    }
  }

  shuffleItems() {
    this.shuffledItems = this.shuffle(this.items);
  }

  shuffle(array) {
    const copy = [...array];
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [copy[currentIndex], copy[randomIndex]] = [
        copy[randomIndex], copy[currentIndex]];
    }

    return copy;
  }
}