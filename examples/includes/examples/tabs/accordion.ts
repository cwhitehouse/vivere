import { VivereComponent } from '../../../../src/vivere';
import Section from './section';

export default class Accordion extends VivereComponent {
  activeSection?: string = null;

  $stored = {
    activeSection: {
      type: 'local',
    },
  };

  connected(): void {
    const { $children, activeSection } = this;

    if (activeSection == null && !!$children.length) {
      const firstChild = $children[0];
      if (firstChild instanceof Section)
        this.activeSection = firstChild.value;
    }
  }

  selectSection(value: string): void {
    this.activeSection = value;
  }
};
