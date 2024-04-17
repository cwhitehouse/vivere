import AntecedentConditionalDirective from './antecedent';

export default class ElseIfDirective extends AntecedentConditionalDirective {
  static id = 'v-else-if';

  parseExpression(): any {
    const newValue = super.parseExpression();
    return newValue && !this.antecedentValue;
  }
}
