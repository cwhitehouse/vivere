import DisplayDirective from './display';
import Watcher from '../../reactivity/watcher';
import Evaluator from '../../lib/evaluator';
import VivereError from '../../error';

interface Filtered {
  element: Element;
  filtered: boolean;
}

export default class FilterDirective extends DisplayDirective {
  static id = 'v-filter';

  // Evaluation

  evaluateValue(value: unknown): void {
    Watcher.assign(this, () => { this.component.$queueRender(this); });

    if (value != null && typeof value !== 'string')
      throw new VivereError('Filter directive requires a string expression');

    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('FilterDirective.evaluateValue');
    console.log('-');
    console.log(value);

    // Loop through and evaluate necessary information
    const children: Filtered[] = [];
    Object.values(this.element.children).forEach((element) => {
      const { $component } = element;

      if ($component == null)
        throw new VivereError('Filter directive requires all children to be components');

      let filtered: boolean;
      if (value != null)
        filtered = !Evaluator.read($component, value);
      else
        filtered = false;

      children.push({ element, filtered });
    });

    console.log('-');
    console.log(children);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    // TODO: Filter elements

    Watcher.clear();
  }
}
