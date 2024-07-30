import { Component } from "../../../../src/vivere";

let id = 4;

export default class extends Component {
  toDos;

  creating = false;
  filter = null;
  sort = null;
  text = null;

  get orderBy() {
    const { sort } = this;

    switch (sort) {
      case 'alphaAsc':
        return [['label'], ['asc']];
      case 'alphaDesc':
        return [['label'], ['desc']];
      default:
        return [['id'], ['asc']];
    };
  }

  get sortedList() {
    const { orderBy, toDos } = this;

    return this.orderArrayBy(toDos, orderBy[0], orderBy[1]);
  }

  get lowerText() {
    const { text } = this;
    return text && text.toLowerCase();
  }

  get filteredList() {
    const { filter, lowerText, sortedList } = this;

    return sortedList.filter((toDo) => {
      const lowerLabel = toDo.label?.toLowerCase();
      return (!filter?.length || toDo.tags?.includes(filter)) &&
        (!lowerText?.length || lowerLabel?.includes(lowerText));
    });
  }

  get filtering() {
    const { filter } = this;
    return filter != null
      && filter.length > 0;
  }

  onFilterChanged() {
    if (this.filter != null)
      this.text = null;
  }

  startCreating() {
    this.creating = true;
  }

  stopCreating() {
    this.creating = false;
  }

  orderArrayBy(array, keys, directions){
    return [...array].sort((a, b) => {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const aVal = a[key];
        const bVal = b[key];

        const direction = directions[i];
        const ascending = direction === 'asc';

        if (aVal > bVal) return ascending ? 1 : -1;
        if (bVal > aVal) return ascending ? -1 : 1;
      }

      return 0;
    });
  }

  create(label) {
    this.$log(label);
    id += 1;
    this.toDos.push({ id, label, tags: [] });
  }

  removeItem(toDo) {
    const { toDos } = this;

    const ids = toDos.map((toDo) => toDo.id);
    const idx = ids.indexOf(toDo.id);

    if (idx >= 0)
      toDos.splice(idx, 1);
  }
};
