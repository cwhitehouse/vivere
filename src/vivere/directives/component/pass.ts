import Directive from '../directive';
import { Reactive } from '../../reactivity/reactive';
import VivereError from '../../lib/error';

export default class PassDirective extends Directive {
  static id = 'v-pass';
  static forComponent = true;

  // Parsing

  parse(): void {
    const parent = this.component.$parent;
    if (parent == null) throw new VivereError('Cannot pass properties to a parentless component');

    let readKey: string;
    if (this.expression != null) readKey = this.expression;
    else readKey = this.key;

    const reactive: Reactive = parent.$reactives[readKey];
    reactive.registerHook(this, () => this.component.$react(this.key));

    this.component.$pass(this.key, reactive);
  }
}
