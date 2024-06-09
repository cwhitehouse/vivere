import Directive from './directive';

export default class RefDirective extends Directive {
  static id = 'ref';

  // Parsing

  parse(): void {
    const { component, element, expression } = this;

    if (this.onComponent()) {
      const { $parent } = component;
      if ($parent != null) $parent.$refs[expression] = component;
    }

    component.$refs[expression] = element;
  }
}
