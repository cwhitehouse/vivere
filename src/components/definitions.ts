import VivereError from '../errors/error';
import Registry from '../reactivity/registry';
import VivereComponent from './vivere-component';

const $definitions = new Registry<string, typeof VivereComponent>();

export default {
  // Track definitions
  register: (name: string, definition: typeof VivereComponent): void => {
    let isValid = false;
    let prototype = definition;
    while (prototype != null && prototype !== Object.prototype) {
      if (prototype === VivereComponent) {
        isValid = true;
        break;
      }
      prototype = Object.getPrototypeOf(prototype);
    }

    if (!isValid)
      throw new VivereError(`Tried to register component ${name} that does not extend VivereComponent`);

    $definitions.register(name, definition);
  },

  // Get definitions
  getDefinition: (name: string): typeof VivereComponent => {
    if (name == null || name.length <= 0)
      return VivereComponent;

    return $definitions.get(name);
  },
};
