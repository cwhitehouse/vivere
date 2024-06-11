import { Component } from '../../../../src/vivere';

export default class Section extends Component {
  value?: string = null;
  activeSection?: string;

  get isActive(): boolean {
    const { activeSection, value } = this;
    return value === activeSection;
  }

  get isInactive(): boolean {
    const { isActive } = this;
    return !isActive;
  }

  select(): void {
    this.$dispatch('select', this.value);
  }
}
