import { DisplayDirective } from './display';

export class TextDirective extends DisplayDirective {
  static id: string = 'v-text';


  // Evaluation

  evaluateValue(value: any) {
    this.element.textContent = value;
  }
};
