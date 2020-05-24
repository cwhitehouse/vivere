import DisplayDirective from './display';
import Watcher from '../../reactivity/watcher';
import Evaluator from '../../lib/evaluator';
import VivereError from '../../error';
import DOM from '../../lib/dom';
let FilterDirective = /** @class */ (() => {
    class FilterDirective extends DisplayDirective {
        // Parsing
        parse() {
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
        evaluateValue(value) {
            const callback = () => { this.component.$queueRender(this); };
            Watcher.watch(this, callback, () => {
                if (value != null && typeof value !== 'string')
                    throw new VivereError('Filter directive requires a string expression');
                // We know value is null or a string
                const $value = value;
                // Loop through and evaluate necessary information
                const filtereds = [];
                this.children.forEach((host) => {
                    const { element } = host;
                    const { $component } = element;
                    if ($component == null)
                        throw new VivereError('Filter directive requires all children to be components');
                    let filtered;
                    if ($value != null)
                        filtered = !Evaluator.read($component, $value);
                    else
                        filtered = false;
                    filtereds.push({ host, filtered });
                });
                // Filter elements
                filtereds.forEach(({ host, filtered }) => { DOM.conditionallyRender(host, !filtered); });
            });
        }
        // Dehdyration
        dehydrate() {
            // Re-attach all elments to the DOM
            this.children.forEach((c) => { DOM.conditionallyRender(c, true); });
            // Dehydrate
            super.dehydrate();
        }
    }
    FilterDirective.id = 'v-filter';
    return FilterDirective;
})();
export default FilterDirective;
