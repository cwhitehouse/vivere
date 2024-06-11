import VivereError from '../errors/error';
import Registry from '../reactivity/registry';
import Component from './component';

const $definitions = new Registry<string, typeof Component>();

export default {
  // Track definitions
  register: (name: string, definition: typeof Component): void => {
    let isValid = false;
    let prototype = definition;
    while (prototype != null && prototype !== Object.prototype) {
      if (prototype === Component) {
        isValid = true;
        break;
      }
      prototype = Object.getPrototypeOf(prototype);
    }

    if (!isValid)
      throw new VivereError(`Tried to register component ${name} that does not extend Component`);

    $definitions.register(name, definition);
  },

  // Get definitions
  getDefinition: (name: string): typeof Component => $definitions.get(name),
};
