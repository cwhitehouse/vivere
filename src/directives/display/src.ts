import DisplayDirective from './display';
import DirectiveError from '../../errors/directive-error';

export default class SrcDirective extends DisplayDirective {
  static id = 'v-src';

  element: HTMLImageElement;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'IMG')
      throw new DirectiveError(`Src directives only work on image elements, not ${nodeName}`, this);
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.src = (value && value.toString());
  }
}
