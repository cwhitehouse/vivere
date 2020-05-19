import { DisplayDirective } from './display';

const ifClass = 'hidden';

export class IfDirective extends DisplayDirective {
  static id: string = 'v-if';


  // Evaluation

  evaluateValue(value: any) {
    if (value)
      this.element.classList.remove(ifClass);
    else
      this.element.classList.add(ifClass);
  }
};
