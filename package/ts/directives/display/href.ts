import DisplayDirective from './display';
import VivereError from '../../error';

export default class HrefDirective extends DisplayDirective {
  static id = 'v-href';

  element: HTMLAnchorElement;
  event: string;
  binding: (event: Event) => boolean;

  // Parsing

  parse(): void {
    // Validate our element node
    const { nodeName } = this.element;
    if (nodeName !== 'A')
      throw new VivereError(`Href directives only work on anchor elements, not ${nodeName}`);
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.href = value?.toString();
  }
}
