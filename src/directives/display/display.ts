import Directive from '../directive';
import Evaluator from '../../lib/evaluator';
import Watcher from '../../reactivity/watcher';
import DirectiveError from '../../errors/directive-error';
import ErrorHandler from '../../lib/error-handler';

export default class DisplayDirective extends Directive {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastValue: any;

  $dirty = true;

  renderCallback(): void {
    this.dirty();
    this.component.$queueRender(this);
  }

  // Evaluation

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseExpression(): any {
    const { component, expression, renderCallback } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any;
    Watcher.watch(this, renderCallback.bind(this), () => {
      value = Evaluator.parse(component, expression);
    });

    return value;
  }

  evaluate(): void {
    ErrorHandler.handle(() => {
      let { renderController } = this;

      let shouldRender: boolean;
      if (renderController != null) {
        shouldRender = true;

        do {
          const ancestorShouldEvaluate = renderController.shouldRender();
          if (!ancestorShouldEvaluate)
            // Whichever render controller tells us not to render should
            // also keep track of this Directive so that it can be rendered
            // whenever that ancestor's logic changes
            renderController.awaitingRender.add(this);

          shouldRender = shouldRender && ancestorShouldEvaluate;
          renderController = renderController.renderController;
        } while (shouldRender && renderController != null);
      } else
        shouldRender = true;

      if (shouldRender) {
        const value = this.parseExpression();

        this.evaluateValue(value);
        this.lastValue = value;
      }

      this.clean();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateValue(value: unknown): void {
    throw new DirectiveError('Directives must implement `evaluateValue`', this);
  }

  dirty(): void {
    this.$dirty = true;
  }

  clean(): void {
    this.$dirty = false;
  }
}
