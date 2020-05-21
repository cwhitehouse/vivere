import DisplayDirective from './display';
import DOM, { NodeHost } from '../../lib/dom';

export default class IfDirective extends DisplayDirective implements NodeHost {
  static id = 'v-if';

  container: Node;
  current: Node;
  placeholder: Node;

  // Parsing

  parse(): void {
    this.container = this.element.parentElement;
    this.placeholder = document.createComment('');
    this.current = this.element;
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    DOM.conditionallyRender(this, !!value);
  }
}
