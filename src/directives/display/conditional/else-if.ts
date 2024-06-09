import AntecedentConditionalDirective from './antecedent';

export default class ElseIfDirective extends AntecedentConditionalDirective {
  static id = 'else-if';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseExpression(): any {
    const newValue = super.parseExpression();
    return newValue && !this.antecedentValue;
  }
}
