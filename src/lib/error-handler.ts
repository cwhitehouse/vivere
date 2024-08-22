import { Vivere } from '../vivere';

export default {
  handle: (block: () => void): void => {
    try {
      block();
    } catch (error) {
      const { options } = Vivere;
      const { suppressErrors, logErrors } = options;

      if (!suppressErrors) throw error;
      else if (logErrors) console.warn(error.message);
    }
  },
};
