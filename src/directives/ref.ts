import Directive from './directive';

export default class RefDirective extends Directive {
  static id = 'v-ref';

  // Parsing

  parse(): void {
    if (this.onComponent()) {
      const { parent } = this.context;
      if (parent != null) parent.refs[this.expression] = this.component;
    }

    this.context.refs[this.expression] = this.element;
  }
}
