import VivereError from './error';
import Printer from '../lib/printer';

export default class EvaluatorError extends VivereError {
  constructor(message: string, object: unknown, expression: string, error?: Error) {
    let errorMessage = `${message}

  ${Printer.print(object)}

  Expression
    ${Printer.print(expression)}

`;

    if (error != null)
      errorMessage += `  ${error}`;

    super(errorMessage);
  }
}
