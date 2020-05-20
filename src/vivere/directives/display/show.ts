import DisplayDirective from './display';

const showClass = 'hidden';

export default class ShowDirective extends DisplayDirective {
  static id = 'v-show';

  // Evaluation

  evaluateValue(value: unknown): void {
    if (value) this.element.classList.remove(showClass);
    else this.element.classList.add(showClass);
  }
}
