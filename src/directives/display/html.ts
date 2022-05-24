import DisplayDirective from './display';

export default class HtmlDirective extends DisplayDirective {
  static id = 'v-html';

  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.innerHTML = value?.toString() || null;
  }
}
