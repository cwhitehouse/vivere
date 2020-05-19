import { DisplayDirective } from './display';

export class ClassDirective extends DisplayDirective {
  static id: string = 'v-class';


  // Parsing

  parse() {
    if (this.key == null)
      throw "Class directive requires a key";
  }


  // Evaluation

  evaluateValue(value: any) {
    if (value)
      this.element.classList.add(this.key);
    else
      this.element.classList.remove(this.key);
  }
};
