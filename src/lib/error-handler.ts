import { Vivere } from '../vivere';

export default {
  handle: (block: () => void): void => {
    try {
      block();
    } catch (error) {
      const { suppressErrors, logErrors } = Vivere.getOptions();

      if (!suppressErrors)
        throw error;
      else if (logErrors)
        // eslint-disable-next-line no-console
        console.warn(error.message);
    }
  },
};
