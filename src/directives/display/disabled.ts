import DisplayDirective from './display';
import DirectiveError from '../../errors/directive-error';

export default class DisabledDirective extends DisplayDirective {
  static id = 'v-disabled';
  element: HTMLInputElement | HTMLButtonElement;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'INPUT' && nodeName !== 'BUTTON')
      throw new DirectiveError(`Disabled directives only work on inputs and buttons, not ${nodeName}`, this);
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.disabled = !!value;
  }
}
