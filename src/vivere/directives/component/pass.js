import { Directive } from '../directive.js';

export class PassDirective extends Directive {
 static name = 'v-pass';
 static forComponent = true;

  // Parsing

  parse() {
    const parent = this.component.$parent;
    if (parent == null) {
      throw "Cannot pass properties to a parentless component";
    }

    let readKey;
    if (this.expression != null)
      readKey = this.expression;
    else
      readKey = this.key;

    const reactive = parent.$reactives[readKey];
    reactive.hooks.push((was, is) => {
      this.component.$react(this.key, was, is);
    });
    this.component.$pass(this.key, reactive);
  }
};
