import { Component } from '../../src/vivere';

export default class extends Component {
  filterTag: string = null;
  filterText: string = null;

  updateFilter(tag: string): void {
    this.filterTag = tag;
  }
}
