import DirectiveError from '../../errors/directive-error';
import Watcher from '../../reactivity/watcher';
import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';

export default class ListDirective extends DisplayDirective {
  static id = 'v-list';

  parent: HTMLElement;

  // Parsing

  parse(): void {
    // Save this element as a template
    // Do something with the directives
    const { element } = this;

    // Save the parent element for appending children later
    this.parent = element.parentElement;

    // Remove our element from the parent
    this.parent.removeChild(element);

    // Validate that we only have the list item as a child
    if (this.parent.children.length)
      throw new DirectiveError("An element with a list directive must be its parent's only child", this);
  }

  // Evaluation

  parseExpression(): unknown {
    const { component, expression } = this;
    const callback = (): void => { component.$queueRender(this); };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any;
    Watcher.watch(this, callback, () => {
      const [itemExp, preoposition, listExp, ...rest] = expression.split(' ');

      if (rest.length > 0 || preoposition !== 'of')
        throw new DirectiveError('Invalid list expression, must resemble `item of list`', this);

      // Parse the list expression
      value = {
        list: Evaluator.parse(component, listExp),
        item: itemExp,
      };
    });

    return value;
  }

  evaluateValue(value: { item: string, list: unknown[] }): void {
    const { component, element, parent } = this;
    const { item, list } = value;

    // Remove elements from the parent
    while (parent.firstChild)
      parent.removeChild(parent.lastChild);

    if (list == null)
      return;

    if (!list.length)
      return;

    if (!Array.isArray(list))
      throw new DirectiveError('v-list directive expected an array for null to be returned', this);

    // Render the appropriate items via the template
    for (let i = 0; i < list.length; i += 1) {
      // Find the relevant item
      const itemData = list[i];

      // Duplicate our template element
      const el: HTMLElement = element.cloneNode(true) as HTMLElement;

      // Add relevant directives to get data rendering to work properly
      el.setAttribute('v-component', '');
      el.setAttribute(`v-data:${item}`, JSON.stringify(itemData));

      // Add the cloned node back to the list
      component.$attachElement(el, parent);
    }
  }
}
