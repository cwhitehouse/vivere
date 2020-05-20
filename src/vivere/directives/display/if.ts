import DisplayDirective from './display';

export default class IfDirective extends DisplayDirective {
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
    let newNode: Node;
    if (value) newNode = this.element;
    else newNode = this.placeholder;

    if (newNode !== this.current) {
      this.container.replaceChild(newNode, this.current);
      this.current = newNode;
    }
  }
}
