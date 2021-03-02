import DisplayDirective from './display';
import Watcher from '../../reactivity/watcher';
import Evaluator from '../../lib/evaluator';
import DOM, { NodeHost } from '../../lib/dom';
import DirectiveError from '../../errors/directive-error';

interface Filtered {
  host: NodeHost;
  filtered: boolean;
}

export default class FilterDirective extends DisplayDirective {
  static id = 'v-filter';

  children: NodeHost[];

  // Parsing

  parse(): void {
    this.children = [];
    Object.values(this.element.children).forEach((element) => {
      this.children.push({
        element,
        current: element,
        container: this.element,
        placeholder: document.createComment(''),
      });
    });
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    const { children, context } = this;

    const callback = (): void => { context.queueRender(this); };
    Watcher.watch(this, callback, () => {
      if (value != null && typeof value !== 'string')
        throw new DirectiveError('Filter directive requires a string expression', this);

      // We know value is null or a string
      const $value: string = value as string;

      // Loop through and evaluate necessary information
      const filtereds: Filtered[] = [];
      children.forEach((host) => {
        const { element } = host;
        const { $component } = element;

        if ($component == null)
          throw new DirectiveError('Filter directive requires all children to be components', this);

        let filtered: boolean;
        if ($value != null)
          filtered = !Evaluator.parse($component, $value);
        else
          filtered = false;

        filtereds.push({ host, filtered });
      });

      // Filter elements
      let hasChild = false;
      filtereds.forEach(({ host, filtered }) => {
        hasChild = hasChild || !filtered;
        DOM.conditionallyRender(host, !filtered);
      });
      DOM.toggleClass(this.element, 'v-filter-empty', !hasChild);
    });
  }


  // Dehdyration

  dehydrate(): void {
    // Re-attach all elments to the DOM
    this.children.forEach((c) => { DOM.conditionallyRender(c, true); });

    // Dehydrate
    super.dehydrate();
  }
}
