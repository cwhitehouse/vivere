import { Directive } from '../directive';
import { Reactive } from '../../reactivity/reactive';

export class PassDirective extends Directive {
 static id: string            = 'v-pass';
 static forComponent: boolean = true;


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

    const reactive: Reactive = parent.$reactives[readKey];
    reactive.registerHook(this, (was: any, is: any) => {
      this.component.$react(this.key, was, is);
    });

    this.component.$pass(this.key, reactive);
  }
};
