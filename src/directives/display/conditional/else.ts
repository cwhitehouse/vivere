import AntecedentConditionalDirective from './antecedent';

export default class ElseDirective extends AntecedentConditionalDirective {
  static id = 'else';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseExpression(): any {
    return !this.antecedentValue;
  }
}
