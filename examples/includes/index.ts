import { VivereComponent } from '../../src/vivere';

export default class extends VivereComponent {
  filterTag: string = null;
  filterText: string = null;

  updateFilter(tag: string): void {
    this.filterTag = tag;
  }
}
