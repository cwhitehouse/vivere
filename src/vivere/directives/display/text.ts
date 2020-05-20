import DisplayDirective from './display';

export default class TextDirective extends DisplayDirective {
  static id = 'v-text';

  // Evaluation

  evaluateValue(value: any): void {
    this.element.textContent = value;
  }
}
