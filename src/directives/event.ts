import Directive from './directive';
import Evaluator from '../lib/evaluator';
import Utility from '../lib/utility';
import DirectiveError from '../errors/directive-error';

const listenerRegex = /on[A-Z][A-z]+Changed/;

export default class EventDirective extends Directive {
  static id = 'v-event';

  static shortcut = '@';

  static requiresKey = true;

  binding: (event: Event) => boolean;

  clickOutsideBinding: (event: Event) => void;

  // Parsing

  parse(): void {
    const { component, element, expression, key, modifiers } = this;

    if (expression == null && !(modifiers?.includes('prevent') || modifiers?.includes('cancel')))
      throw new DirectiveError('Events must `prevent` or `cancel` to be valid without an expression', this, null);

    // Bind this for our callback
    this.binding = this.execute.bind(this);

    const camelKey = Utility.camelCase(key);
    if (['beforeConnected', 'connected', 'rendered', 'beforeDehydrated', 'beforeDestroyed'].includes(camelKey))
      // We can listen for callbacks on the component with special logic here
      // that ignores modifiers, etc.
      component.$addCallbackListener(camelKey, this.binding);
    else if (listenerRegex.test(camelKey))
      component.$addCallbackListener(camelKey, this.binding);
    else {
      // Otherwise we treat it as a normal event that will come from
      // the element
      this.clickOutsideBinding = this.handleClickOutside.bind(this);

      if (key === 'click' && modifiers?.includes('outside'))
        // Click outside requires special handling
        document.addEventListener('click', this.clickOutsideBinding);
      else
        element.addEventListener(key, this.binding);
    }
  }

  // Destruction (detach event listeners)

  destroy(): void {
    const { clickOutsideBinding, binding, key } = this;

    const camelKey = Utility.camelCase(key);
    this.component?.$removeCallbackListener(camelKey, binding);
    this.element.removeEventListener(key, binding);
    document.removeEventListener('click', clickOutsideBinding);

    super.destroy();
  }

  // Execution

  handleClickOutside(e: Event): void {
    // Check that we clicked on an element
    if (e.target instanceof Element) {
      // CHeck if click target was a descendant of this element
      let clickTarget = e.target;

      do {
        if (clickTarget === this.element)
          return;

        clickTarget = clickTarget.parentElement;
      } while (clickTarget != null);
    }

    // Execute the event if the target was not an element
    // or was not a descendant of this element
    this.binding(e);
  }

  execute(e: Event): boolean {
    const { expression, modifiers } = this;

    // Keydown Directives can be scoped via modifiers
    if (e instanceof KeyboardEvent && modifiers != null && modifiers.length > 0) {
      const { key, keyCode } = e;
      const matchesModifier = modifiers.some((mod) => this.matchesKeycode(key, keyCode, mod));
      if (!matchesModifier) return undefined;
    }

    if (expression?.length)
      if (modifiers?.includes('delay'))
        setTimeout(() => this.executeEvent(e), 0);
      else
        this.executeEvent(e);
    else if (!modifiers?.includes('cancel') && !modifiers?.includes('prevent'))
      throw new DirectiveError('Event directives require an expression, unless using the cancel or prevent flag', this);

    if (modifiers?.includes('prevent'))
      e.preventDefault();

    if (modifiers != null && modifiers.includes('cancel'))
      return false;

    return undefined;
  }

  executeEvent(e: Event): void {
    const { component, expression } = this;
    Evaluator.execute(component, expression, e);
  }

  // Key matching

  matchesKeycode(key: string | null, keyCode: number | null, keyEvent: string): boolean {
    const $key = Utility.kebabCase(key);

    switch (keyEvent) {
      case 'enter':
      case 'ent':
        return $key === 'enter'
          || keyCode === 13;
      case 'escape':
      case 'esc':
        return $key === 'escape'
          || keyCode === 27;
      case 'up':
        return $key === 'arrow-up'
          || keyCode === 38;
      case 'down':
        return $key === 'arrow-down'
          || keyCode === 40;
      case 'left':
        return $key === 'arrow-left'
          || keyCode === 37;
      case 'right':
        return $key === 'arrow-right'
          || keyCode === 39;
      default:
    }

    const keyEventCode = Number.parseInt(keyEvent, 10);
    if (Number.isNaN(keyEventCode))
      return keyEvent === $key;

    return keyEventCode === keyCode;
  }
}
