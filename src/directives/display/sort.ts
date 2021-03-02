import DisplayDirective from './display';
import Watcher from '../../reactivity/watcher';
import Evaluator from '../../lib/evaluator';
import Utility from '../../lib/utility';
import DirectiveError from '../../errors/directive-error';

interface Sorter {
  element: Element;
  prop?: unknown;
}

export default class SortDirective extends DisplayDirective {
  static id = 'v-sort';

  // Evaluation

  evaluateValue(value: unknown): void {
    const callback = (): void => { this.context.queueRender(this); };
    Watcher.watch(this, callback, () => {
      // Ignore null values
      if (value == null) return;

      // Sort expression needs to be an object
      if (!Array.isArray(value))
        throw new DirectiveError('Sort directive requires an array of options', this);

      let [sortKeys] = value;
      const [, sortOrders] = value;

      if (!Array.isArray(sortKeys))
        throw new DirectiveError('Sort directive requires an array of keys to sort by', this);
      if (!Array.isArray(sortOrders))
        throw new DirectiveError('Sort directive requires an array of orders to sort by', this);

      // Loop through and evaluate necessary information
      const children: Sorter[] = [];
      Object.values(this.element.children).forEach((element) => {
        const { $component } = element;

        if ($component == null)
          throw new DirectiveError('Sort directive requires all children to be components', this);

        const child: Sorter = { element };
        sortKeys.forEach((expression) => {
          const sortValue = Evaluator.parse($component, expression);
          const sortKey = this.finalPart(expression);

          child[sortKey] = sortValue;
        });
        children.push(child);
      });

      // Re-order child elements
      sortKeys = sortKeys.map((key) => this.finalPart(key));
      Utility.orderBy(children, sortKeys, sortOrders).forEach((sorter) => {
        const { element } = sorter;
        this.element.removeChild(element);
        this.element.appendChild(element);
      });
    });
  }

  finalPart(expression: string): string {
    const parts = expression.split('.');
    return parts[parts.length - 1];
  }
}
