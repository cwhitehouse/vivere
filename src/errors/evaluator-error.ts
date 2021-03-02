import VivereError from './error';
import Printer from '../lib/printer';

export default class EvaluatorError extends VivereError {
  constructor(message: string, object: object, expression: string, error?: Error) {
    let errorMessage = `${message}

    ${Printer.print(object)}

    ${Printer.print(expression)}`;

    if (error != null)
      errorMessage += `\n  ${error}`;

    super(errorMessage);
  }
}
