import DisplayDirective from './display';
import VivereError from '../../error';

export default class HrefDirective extends DisplayDirective {
  static id = 'v-src';

  element: HTMLImageElement;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'IMG')
      throw new VivereError(`Src directives only work on image elements, not ${nodeName}`);
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.src = (value && value.toString());
  }
}
