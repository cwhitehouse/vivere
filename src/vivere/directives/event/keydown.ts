import { EventDirective } from './event';

export class KeydownDirective extends EventDirective {
  static id: string = 'v-keydown';

  // Execution

  execute(e: KeyboardEvent) {
    // Scope to a particular keycode if
    // a key parameter was provided
    if (this.key != null && !this.matchesKeycode(e.key || e.keyCode))
      return;

    super.execute(e);
  }


  // Key matching

  matchesKeycode(keyCode: string | number) {
    switch (this.key) {
      case 'enter':
        return keyCode === 'Enter'
          || keyCode === 13;
      case 'escape':
        return keyCode === 'Escape'
          || keyCode === 27;
      default:
    };

    if (typeof keyCode === 'string')
      return this.key === keyCode.toLowerCase();
    else
      return this.key === keyCode.toString();
  }

};
