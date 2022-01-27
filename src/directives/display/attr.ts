import DisplayDirective from './display';

export default class DisabledDirective extends DisplayDirective {
  static id = 'v-attr';

  static requiresKey = true;

  // Evaluation

  evaluateValue(value: unknown): void {
    const { key, element } = this;

    if (value == null)
      element.removeAttribute(key);
    else
      element.setAttribute(key, value.toString());
  }
}
