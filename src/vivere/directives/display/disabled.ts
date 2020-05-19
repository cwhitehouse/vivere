import { DisplayDirective } from './display';

export class DisabledDirective extends DisplayDirective {
  static id: string = 'v-disabled';


  // Evaluation

  evaluateValue(value: any) {
    this.element.disabled = !!value;
  }
};
