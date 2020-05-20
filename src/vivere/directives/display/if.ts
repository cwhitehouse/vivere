import DisplayDirective from './display';

const ifClass = 'hidden';

export default class IfDirective extends DisplayDirective {
  static id = 'v-if';

  // Evaluation

  evaluateValue(value: any): void {
    if (value) this.element.classList.remove(ifClass);
    else this.element.classList.add(ifClass);
  }
}
