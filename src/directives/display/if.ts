import DisplayDirective from './display';
import DOM, { NodeHost } from '../../lib/dom';
import Walk from '../../lib/walk';
import Animator from '../../lib/animator';

export default class IfDirective extends DisplayDirective implements NodeHost {
  static id = 'v-if';

  container: Node;

  current: Node;

  placeholder: Node;

  evaluated = false;

  rendered = false;

  animator: Animator;

  // Parsing

  parse(): void {
    const { element, modifiers } = this;
    const { parentElement } = element;

    this.container = parentElement;
    this.placeholder = document.createComment('');
    this.current = element;

    element.removeAttribute('hidden');

    this.suspendParsing();

    // Parse animation properties
    const shouldAnimateVertical = modifiers.includes('anim-y');
    const shouldAnimateHorizontal = modifiers.includes('anim-x');
    const shouldAnimate = shouldAnimateVertical || shouldAnimateHorizontal;
    if (shouldAnimate)
      // Set up our animator if need be
      this.animator = new Animator(element as HTMLElement, shouldAnimateVertical, (showing: boolean) => {
        // Remove the element from DOM if needed
        if (!showing) DOM.conditionallyRender(this, false);
      });
  }

  // Evaluation

  evaluateValue(value: unknown): void {
    const { component, element, evaluated, rendered } = this;
    const showing = !!value;

    // Don't bother evaluating if our value hasn't changed
    if (this.lastValue === showing)
      return;

    // Don't continue parsing the component tree until
    // this is being evaluated
    const firstRender = !rendered;
    if (showing && firstRender) {
      this.rendered = true;
      this.resumeParsing();
      Walk.tree(element, component);
      component.$forceRender();
    }

    // Check if we should be animating based on directive modifiers
    // If we've evaluated at least once, and we're supposed to animate, let's do it!
    const { animator } = this;
    if (evaluated && animator) {
      const { running } = animator;

      if (showing && !running)
        // We need to add elements into existence before they can
        // be animated
        DOM.conditionallyRender(this, true);

      if (!running)
        animator.start(showing);
      else
        animator.reverse();
    } else
      DOM.conditionallyRender(this, showing);

    // Track whether this has been evaluated to avoid
    // animating on our first evaluation
    this.evaluated = true;
  }

  // Dehdyration

  dehydrate(): void {
    // Interrupt any animations
    this.animator?.cancel();

    // Re-attach element to the DOM
    DOM.conditionallyRender(this, true);

    // Dehydrate
    super.dehydrate();
  }
}
