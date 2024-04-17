import AntecedentConditionalDirective from './antecedent';

export default class ElseDirective extends AntecedentConditionalDirective {
  static id = 'v-else';

  parseExpression(): any {
    return !this.antecedentValue;
  }
}
