import DirectiveError from '../../errors/directive-error';
import Watcher from '../../reactivity/watcher';
import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import Directive from '../directive';
import Utility from '../../lib/utility';
import { VivereComponent } from '../../vivere';

export default class ListDirective extends DisplayDirective {
  static id = 'v-list';

  parent: HTMLElement;

  placeholder: Node;

  listElements: (VivereComponent | HTMLElement)[] = [];

  // Parsing

  parse(): void {
    // Save this element as a template
    // Do something with the directives
    const { element } = this;

    // Mark this element as one we want to stop processing
    if (element instanceof HTMLElement)
      element.dataset[Directive.DATA_SUSPEND_PARSING] = 'true';

    // Create a placeholder node to mark where our list should be inserted
    this.placeholder = document.createComment('');

    // Save the parent element for appending children later
    this.parent = element.parentElement;

    // Insert our comment before this element
    this.parent.insertBefore(this.placeholder, element);

    // Remove our element from the parent
    this.parent.removeChild(element);
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
        listExpression: listExp,
        item: itemExp,
      };
    });

    return value;
  }

  evaluateValue(value: { item: string, list: unknown[], listExpression: string }): void {
    const { component, element, listElements, parent, placeholder } = this;
    const { item, list, listExpression } = value;

    // Remove elements from the parent
    while (listElements.length) {
      const el = listElements.pop();
      if (el instanceof VivereComponent)
        el.$destroy();
      else
        el.remove();
    }

    if (list == null)
      return;

    if (!list.length)
      return;

    if (!Array.isArray(list))
      throw new DirectiveError('v-list directive expected an array for null to be returned', this);

    let insertBefore: Node = placeholder;
    // Render the appropriate items via the template
    // NOTE: We render the list backwards because we will
    //   user insertBefore to insert the items in the
    //   right place
    for (let i = list.length - 1; i >= 0; i -= 1) {
      // Duplicate our template element
      const el: HTMLElement = element.cloneNode(true) as HTMLElement;

      // If the list item doesn't already have a `v-component` directive, add one to
      // make each list item behave as a component
      if (!el.hasAttribute('v-component'))
        el.setAttribute('v-component', '');

      // Pass the invidual list item
      //   e.g. v-pass:to-do="toDos[2]"
      el.setAttribute(`v-pass:${Utility.kebabCase(item)}`, `${listExpression}[${i}]`);

      // Remove the suspend parsing data directive
      delete el.dataset[Directive.DATA_SUSPEND_PARSING];

      // Add the cloned node back to the list and track
      // where the next node is supposed to be inserted
      component.$attachElement(el, parent, insertBefore);
      insertBefore = el;

      // Track the component or element in our array
      // so we can remove it later as needed
      if (el.$component != null)
        listElements.push(el.$component);
      else
        listElements.push(el);
    }
  }
}
