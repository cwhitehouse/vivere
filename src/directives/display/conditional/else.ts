import DirectiveError from '../../../errors/directive-error';
import Directive from '../../directive';
import ConditionalDirective from '../conditional';
import IfDirective from './if';

declare global {
  interface Element {
    $directives?: Directive[];
  }
}

export default class ElseDirective extends ConditionalDirective {
  static id = 'v-else';

  ifDirective: IfDirective;

  parse(): void {
    const { element, key, expression } = this;

    if (key?.length)
      throw new DirectiveError('v-else should not have a key', this);

    if (expression?.length)
      throw new DirectiveError('v-else should not have an expression', this);

    const { previousElementSibling } = element;

    const ifDirective = previousElementSibling?.$directives?.find((d) => d instanceof IfDirective);
    if (ifDirective == null)
      throw new DirectiveError('v-else directives require a preceeding v-if directive', this);

    this.ifDirective = ifDirective as IfDirective;
    this.ifDirective.listeners.register(this, this.renderCallback.bind(this));

    super.parse();
  }

  parseExpression(): any {
    return !this.ifDirective.lastValue;
  }
}
