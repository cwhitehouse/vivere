import DisplayDirective from './display';

export default class DisabledDirective extends DisplayDirective {
  static id = 'v-attr';
  static requiresKey = true;

  // Evaluation

  evaluateValue(value: unknown): void {
    this.element.setAttribute(this.key, `${value}`);
  }
}
