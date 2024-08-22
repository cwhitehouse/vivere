import DirectiveError from '../../../errors/directive-error';
import Directive from '../../directive';
import ConditionalDirective from '../conditional';
import ElseDirective from './else';

declare global {
  interface Element {
    $directives?: Directive[];
  }
}

export default class AntecedentConditionalDirective extends ConditionalDirective {
  antecedent: ConditionalDirective;

  parse(): void {
    const { element } = this;

    const { previousElementSibling } = element;

    const antecedent = previousElementSibling?.$directives?.find(
      d => d instanceof ConditionalDirective,
    );
    if (antecedent instanceof ConditionalDirective)
      this.antecedent = antecedent;

    if (this.antecedent == null || this.antecedent instanceof ElseDirective)
      throw new DirectiveError(
        `${this.id()} directives require a preceeding v-if or v-else-if directive`,
        this,
      );

    // Listen to any changes on the preceeding directives value
    this.registerListeners();

    // Continue parsing
    super.parse();
  }

  registerListeners(): void {
    let { antecedent } = this;
    do {
      antecedent.listeners.register(this, this.renderCallback.bind(this));

      if (antecedent instanceof AntecedentConditionalDirective)
        antecedent = antecedent.antecedent;
      else antecedent = null;
    } while (antecedent != null);
  }

  get antecedentValue(): boolean {
    let value = false;
    let { antecedent } = this;

    while (!value && antecedent != null) {
      value ||= antecedent.lastValue;

      if (antecedent instanceof AntecedentConditionalDirective)
        antecedent = antecedent.antecedent;
      else antecedent = null;
    }

    return value;
  }
}
