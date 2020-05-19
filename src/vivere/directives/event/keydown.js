import { EventDirective } from './event.js';

export class KeydownDirective extends EventDirective {
  static name = 'v-keydown';

  // Execution

  execute(e) {
    // Scope to a particular keycode if
    // a key parameter was provided
    if (this.key != null && !this.matchesKeycode(e.key || e.keyCode))
      return;

    super.execute(e);
  }


  // Key matching

  matchesKeycode(keyCode) {
    switch (this.key) {
      case 'enter':
        return keyCode === 'Enter'
          || keyCode === 13;
      case 'escape':
        return keyCode === 'Escape'
          || keyCode === 27;
      default:
        return this.key === keyCode.toLowercase();
    };
  }

};
