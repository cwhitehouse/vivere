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

  keyedElements: { [key:string]: VivereComponent } = {};

  unkeyedElements: VivereComponent[] = [];

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
      const [itemExpression, preoposition, listExpression, ...rest] = expression.split(' ');

      if (rest.length > 0 || preoposition !== 'of')
        throw new DirectiveError('Invalid list expression, must resemble `item of list`', this);

      // Parse the list expression
      value = {
        list: Evaluator.parse(component, listExpression),
        listExpression,
        itemExpression,
      };
    });

    return value;
  }

  evaluateValue(value: { itemExpression: string, list: unknown[], listExpression: string }): void {
    const { component, element, keyedElements, unkeyedElements, parent, placeholder } = this;
    const { itemExpression, list, listExpression } = value;

    if (list && !Array.isArray(list))
      throw new DirectiveError('v-list directive expected an array or null to be returned', this);

    // Keep track of which components that we're rendering
    const renderedElements: { key: (string | null), el: VivereComponent }[] = [];

    // We need to keep track of where to add new items
    let insertBefore: Node = placeholder;

    // Render the appropriate items via the template
    // NOTE: We render the list backwards because we will
    //   user insertBefore to insert the items in the
    //   right place
    const listLength = list?.length || 0;
    for (let i = listLength - 1; i >= 0; i -= 1) {
      const item = list[i];
      const key = this.itemKey(item);

      // See if we have a cached element with a matching key in our cache,
      // and remove it from the cache to be used
      let cachedElement: VivereComponent | null;
      if (key != null) {
        cachedElement = keyedElements[key];
        delete keyedElements[key];
      } else
        cachedElement = unkeyedElements.pop();

      if (cachedElement == null) {
        // If we don't have a cached element, we'll need to create a new element
        // by duplicating and inserting a copy of the template element

        // Duplicate our template element
        const el: HTMLElement = element.cloneNode(true) as HTMLElement;

        // If the list item doesn't already have a `v-component` directive, add one to
        // make each list item behave as a component
        if (!el.hasAttribute('v-component'))
          el.setAttribute('v-component', '');

        // Pass the invidual list item
        //   e.g. v-pass:to-do="toDos[2]"
        el.setAttribute(`v-pass:${Utility.kebabCase(itemExpression)}.list`, `${listExpression}[${i}]`);

        // Remove the suspend parsing data directive
        delete el.dataset[Directive.DATA_SUSPEND_PARSING];

        // Add the cloned node back to the list and track
        // where the next node is supposed to be inserted
        component.$attachElement(el, parent, insertBefore);
        insertBefore = el;

        // Track the component or element in our array
        // so we can remove it later as needed
        cachedElement = el.$component;
      } else {
        // We need to update the index of the passed data
        // so we display the right list item
        cachedElement.$pass(itemExpression, listExpression, i);

        // Insert this element to make sure it's in the right
        // position for the updated list
        const { $element } = cachedElement;
        // $element.remove();
        parent.insertBefore($element, insertBefore);
        insertBefore = $element;
      }

      // Add this component to our list of rendered components
      renderedElements.push({ key, el: cachedElement });
    }

    // Remove any remaining cached elements we have from the DOM
    Object.values(keyedElements).forEach((ke) => ke.$element.remove());
    unkeyedElements.forEach((ue) => ue.$element.remove());

    // Ensure all our rendered components are cached
    // for the next time the list udpates
    renderedElements.forEach((re) => {
      const { key, el } = re;
      if (key != null)
        keyedElements[key] = el;
      else
        unkeyedElements.push(el);
    });
  }

  itemKey(item: unknown): string | null {
    if (item == null)
      return null;

    if (Array.isArray(item))
      return JSON.stringify(item);

    const props = ['key', 'id', 'name'];
    for (let i = 0; i < props.length; i += 1) {
      const prop = props[i];
      if (item[prop])
        return item[prop].toString();
    }

    return null;
  }
}
