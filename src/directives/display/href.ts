import DirectiveError from '../../errors/directive-error';
import DisplayDirective from './display';

export default class HrefDirective extends DisplayDirective {
  static id = 'v-href';

  element: HTMLAnchorElement;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'A')
      throw new DirectiveError(`Href directives only work on anchor elements, not ${nodeName}`, this);
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    if (!value)
      this.element.removeAttribute('href');
    else
      this.element.href = value.toString();
  }
}
