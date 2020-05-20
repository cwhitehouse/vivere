import DisplayDirective from './display';
import VivereError from '../../lib/error';

export default class DisabledDirective extends DisplayDirective {
  static id = 'v-disabled';
  element: HTMLInputElement | HTMLButtonElement;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'INPUT' && nodeName !== 'BUTTON') throw new VivereError('Sync directives only work on input elements');
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.disabled = !!value;
  }
}
