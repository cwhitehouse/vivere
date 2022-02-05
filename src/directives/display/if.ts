import DisplayDirective from './display';
import DOM, { NodeHost } from '../../lib/dom';
import Walk from '../../lib/walk';

export default class IfDirective extends DisplayDirective implements NodeHost {
  static id = 'v-if';

  container: Node;

  current: Node;

  placeholder: Node;

  rendered = false;

  // Parsing

  parse(): void {
    const { element } = this;
    const { parentElement } = element;

    this.container = parentElement;
    this.placeholder = document.createComment('');
    this.current = element;

    element.removeAttribute('hidden');

    this.suspendParsing();
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    const { component, element, rendered } = this;
    const showing = !!value;

    if (showing && !rendered) {
      this.rendered = true;
      this.resumeParsing();
      Walk.tree(element, component);
      component.$forceRender();
    }

    DOM.conditionallyRender(this, showing);
  }

  // Dehdyration

  dehydrate(): void {
    // Re-attach element to the DOM
    DOM.conditionallyRender(this, true);

    // Dehydrate
    super.dehydrate();
  }
}
