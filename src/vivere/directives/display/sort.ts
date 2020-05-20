import { orderBy } from 'lodash';
import DisplayDirective from './display';
import Watcher from '../../reactivity/watcher';
import Evaluator from '../../lib/evaluator';
import VivereError from '../../error';

interface Sorter {
  element: Element;
  prop?: unknown;
}

export default class SortDirective extends DisplayDirective {
  static id = 'v-sort';

  // Evaluation

  evaluateValue(value: unknown): void {
    Watcher.assign(this, () => { this.component.$queueRender(this); });

    // Ignore null values
    if (value == null) return;

    // Sort expression needs to be an object
    if (!Array.isArray(value))
      throw new VivereError('Sort directive requires an array of options');

    let [sortKeys] = value;
    const [, sortOrders] = value;

    if (!Array.isArray(sortKeys))
      throw new VivereError('Sort directive requires an array of keys to sort by');
    if (!Array.isArray(sortOrders))
      throw new VivereError('Sort directive requires an array of orders to sort by');

    // Loop through and evaluate necessary information
    const children: Sorter[] = [];
    Object.values(this.element.children).forEach((element) => {
      const { $component } = element;

      if ($component == null)
        throw new VivereError('Sort directive requires all children to be components');

      const child: Sorter = { element };
      sortKeys.forEach((expression) => {
        const sortValue = Evaluator.read($component, expression);
        const sortKey = this.finalPart(expression);

        child[sortKey] = sortValue;
      });
      children.push(child);
    });

    // Re-order child elements
    sortKeys = sortKeys.map((key) => this.finalPart(key));
    orderBy(children, sortKeys, sortOrders).forEach((sorter) => {
      const { element } = sorter;
      this.element.removeChild(element);
      this.element.appendChild(element);
    });

    Watcher.clear();
  }

  finalPart(expression: string): string {
    const parts = expression.split('.');
    return parts[parts.length - 1];
  }
}
