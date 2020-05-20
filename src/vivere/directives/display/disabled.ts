import { DisplayDirective } from './display';

export class DisabledDirective extends DisplayDirective {
  static id: string = 'v-disabled';

  element: HTMLInputElement | HTMLButtonElement;


  // Parsing

  parse() {
    // Validate our element node
    const nodeName = this.element.nodeName;
    if (nodeName !== 'INPUT' && nodeName !== 'BUTTON')
      throw 'Sync directives only work on input elements';
  }


  // Evaluation

  evaluateValue(value: any) {
    this.element.disabled = !!value;
  }
};
