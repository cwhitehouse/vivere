import { Directive } from '../directive.js';

export class PassDirective extends Directive {
 static name = 'v-pass';
 static forComponent = true;

  // Parsing

  parse() {
    const parent = this.component.parent;
    if (this.parent == null) {
      throw "Cannot pass properties to a parentless component";
    }

    const parentValue = parent.$reactives[this.key];
    this.component.$pass(this.key, parentValue);
  }
};
