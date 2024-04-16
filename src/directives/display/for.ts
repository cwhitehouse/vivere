import DirectiveError from '../../errors/directive-error';
import Watcher from '../../reactivity/watcher';
import DisplayDirective from './display';
import Evaluator from '../../lib/evaluator';
import Directive from '../directive';
import Utility from '../../lib/utility';
import { VivereComponent } from '../../vivere';
import ToggableRenderController from '../../rendering/togglable-render-controller';

const directiveRegex = /(?:([A-z_$0-9]+)|\(([A-z_$0-9]+), ([A-z_$0-9]+)\)) of ([A-z_$0-9[\]().?]+)/;

interface ForDirectiveValue {
  list: unknown[];
  listExpression: string;
  itemExpression: string;
  indexExpression?: string;
}

export default class ForDirective extends DisplayDirective {
  static id = 'v-for';

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
    this.suspendParsing();

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
    const { component, expression, renderCallback } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any;
    Watcher.watch(this, renderCallback.bind(this), () => {
      try {
        const [, iExp, $iExp, indexExpression, listExpression] = directiveRegex.exec(expression);
        const itemExpression = iExp || $iExp;

        value = {
          list: Evaluator.parse(component, listExpression),
          listExpression,
          itemExpression,
          indexExpression,
        };
      } catch (e) {
        throw new DirectiveError('Invalid v-for expression, must resemble `item of list`', this, e);
      }
    });

    return value;
  }

  evaluateValue(value: ForDirectiveValue): void {
    const { component, element, keyedElements, unkeyedElements, parent, placeholder } = this;
    const { itemExpression, indexExpression, list, listExpression } = value;

    const isList = Array.isArray(list);
    const isObject = list && !isList && (typeof list === 'object');
    if (list && !isList && !isObject)
      throw new DirectiveError('v-for directive expected an array, and object, or null to be returned', this);

    if (isObject && !indexExpression?.length)
      throw new DirectiveError('Invalid v-for expression, must resemble `(key, value) of object`', this);

    // Keep track of which components that we're rendering
    const renderedElements: { key: (string | null), el: VivereComponent }[] = [];

    // We need to keep track of where to add new items
    let insertBefore: Node = placeholder;

    // Render the appropriate items via the template
    // NOTE: We render the list backwards because we will
    //   user insertBefore to insert the items in the
    //   right place
    if (list != null) {
      const keys = Object.keys(list);
      const listLength = keys.length;
      for (let i = listLength - 1; i >= 0; i -= 1) {
        // This will either be an object key, or the array index
        const $key = keys[i];

        // Get the item from the array/object
        const item = list[$key];

        // Generate a key for tracking this element
        const key = isList ? this.itemKey(item) : $key;

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

          if (isList) {
            // Pass the invidual list item
            //   e.g. v-pass:to-do="toDos[2]"
            el.setAttribute(`v-pass:${Utility.kebabCase(itemExpression)}.list`, `${listExpression}[${i}]`);
            if (indexExpression?.length)
              // If we have an index expression, we want to set that as well e.g. v-data:idx="2"
              el.setAttribute(`v-data:${Utility.kebabCase(indexExpression)}`, `${i}`);
          } else {
            // Pass the invidual object item (for objects, item and index are swapped)
            //   e.g. v-pass:to-do="toDos['banana']"
            el.setAttribute(`v-pass:${Utility.kebabCase(indexExpression)}.list`, `${listExpression}['${key}']`);
            el.setAttribute(`v-data:${Utility.kebabCase(itemExpression)}`, `${key}`);
          }

          // Remove the suspend parsing data directive
          this.resumeParsing(el);

          // RenderController management — we need a manual RenderController so we can
          // control list item rendering
          const renderController = new ToggableRenderController(true, this.renderController);

          // Add the cloned node back to the list and track
          // where the next node is supposed to be inserted
          component.$attachElement(el, parent, insertBefore, renderController);
          insertBefore = el;

          // Track the component or element in our array
          // so we can remove it later as needed
          cachedElement = el.$component;
        } else {
          if (isList) {
            // We need to update the index of the passed data
            // so we display the right list item
            cachedElement.$pass(itemExpression, listExpression, i);

            if (indexExpression?.length)
              // Update the index if we have an index expression
              cachedElement.$set(indexExpression, `${i}`);
          } else {
            // We need to update the key of the passed data
            // so we display the right object item
            cachedElement.$pass(indexExpression, listExpression, key);

            // Also pass the key along if we have it
            cachedElement.$set(itemExpression, key);
          }

          // Insert this element to make sure it's in the right
          // position for the updated list
          const { $element } = cachedElement;
          // $element.remove();
          parent.insertBefore($element, insertBefore);
          insertBefore = $element;

          // Flip our TogglableRenderController to true, ensuring any directives on
          // the list item properly render
          if (cachedElement.$renderController instanceof ToggableRenderController)
            cachedElement.$renderController.setShouldRender(true);
        }

        // Add this component to our list of rendered components
        renderedElements.push({ key, el: cachedElement });
      }
    }

    // Remove any remaining cached elements we have from the DOM
    this.removeCachedElements();

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

  removeCachedElements(): void {
    const { keyedElements, unkeyedElements } = this;

    Object.values(keyedElements).forEach((ke) => {
      ke.$element.remove();

      // Ensure none of the child directives render once this
      // element has been removed from the list
      if (ke.$renderController instanceof ToggableRenderController)
        ke.$renderController.setShouldRender(false);
    });
    unkeyedElements.forEach((ue) => {
      ue.$element.remove();

      // Ensure none of the child directives render once this
      // element has been removed from the list
      if (ue.$renderController instanceof ToggableRenderController)
        ue.$renderController.setShouldRender(false);
    });
  }

  dehydrate(): void {
    const { element, parent, placeholder } = this;

    // Remove all of our currently rendered elements from the DOM
    this.removeCachedElements();

    // Replace our placeholder comment with the template element
    parent.replaceChild(element, placeholder);

    // Re-enable parsing for our template element
    if (element instanceof HTMLElement)
      delete element.dataset[Directive.DATA_SUSPEND_PARSING];

    // Default dehydrate behavior
    super.dehydrate();
  }

  // Render Controller

  dirty(): void {
    // Tell of our child elements that they must wait on the list to finish
    // rendering before they can
    [...this.unkeyedElements, ...Object.values(this.keyedElements)].forEach((vc) => {
      if (vc.$renderController != null)
        vc.$renderController.$dirty = true;
    });

    super.dirty();
  }

  clean(): void {
    // Tell of our child elements that the list has been updated and they can proceed
    // with rendering (if they should)
    [...this.unkeyedElements, ...Object.values(this.keyedElements)].forEach((vc) => {
      if (vc.$renderController != null)
        vc.$renderController.$dirty = false;
    });

    super.clean();
  }
}
