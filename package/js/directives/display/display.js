import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import VivereError from '../../error';
export default class DisplayDirective extends Directive {
    // Evaluation
    evaluate() {
        const { component, expression } = this;
        const callback = () => { component.$queueRender(this); };
        Watcher.watch(this, callback, () => {
            let value;
            if (Evaluator.isComparisonOperation(expression))
                value = Evaluator.evaluateComparison(component, expression);
            else
                value = Evaluator.read(component, expression);
            this.evaluateValue(value);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    evaluateValue(value) {
        throw new VivereError('Directives must implement `evaluateValue`');
    }
}
