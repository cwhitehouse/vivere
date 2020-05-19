import { Directive } from './directive';

export class RefDirective extends Directive {
  static id: string = 'v-ref';


  // Parsing

  parse() {
    if (this.onComponent()) {
      const parent = this.component.$parent;
      if (parent != null)
        parent.$refs[this.expression] = this.component;
    }

    this.component.$refs[this.expression] = this.element;
  }
};
