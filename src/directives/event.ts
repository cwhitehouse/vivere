import Directive from './directive';
import Evaluator from '../lib/evaluator';
import EventBus from '../lib/events/bus';
import Event from '../lib/events/event';
import DirectiveError from '../errors/directive-error';

export default class EventDirective extends Directive {
  static id = 'v-event';

  static requiresKey = true;

  binding: (event: Event) => boolean;

  clickOutsideBinding: (event: Event) => void;

  // Parsing

  parse(): void {
    const { element, expression, key, modifiers } = this;

    if (expression == null && !(modifiers?.includes('prevent') || modifiers?.includes('cancel')))
      throw new DirectiveError('Events must `prevent` or `cancel` to be valid without an expression', this, null);

    this.binding = this.execute.bind(this);
    this.clickOutsideBinding = this.handleClickOutside.bind(this);

    if (key === 'click' && modifiers?.includes('outside'))
      // Click outside requires special handling
      EventBus.register(Event.CLICK, this.clickOutsideBinding);
    else
      element.addEventListener(key, this.binding);
  }

  // Destruction (detach event listeners)

  destroy(): void {
    this.element.removeEventListener(this.key, this.binding);
    EventBus.deregister(Event.CLICK, this.clickOutsideBinding);
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
      const keyCode = e.key || e.keyCode;
      const matchesModifier = modifiers.some((mod) => this.matchesKeycode(keyCode, mod));
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

  matchesKeycode(keyCode: string | number, keyEvent: string): boolean {
    switch (keyEvent) {
      case 'enter':
      case 'ent':
        return keyCode === 'Enter'
          || keyCode === 13;
      case 'escape':
      case 'esc':
        return keyCode === 'Escape'
          || keyCode === 27;
      default:
    }

    if (typeof keyCode === 'string')
      return keyEvent === keyCode.toLowerCase();
    return keyEvent === keyCode.toString();
  }
}
