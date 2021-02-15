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

    this.element.removeAttribute('hidden');
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    DOM.conditionallyRender(this, !!value);
  }


  // Dehdyration

  dehydrate(): void {
    // Re-attach element to the DOM
    DOM.conditionallyRender(this, true);

    // Dehydrate
    super.dehydrate();
  }
}
