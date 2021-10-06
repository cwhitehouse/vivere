import VivereError from './error';
import Printer from '../lib/printer';

export default class EvaluatorError extends VivereError {
  constructor(message: string, object: unknown, expression: string, error?: Error) {
    let errorMessage = `${message}\n\n  ${Printer.print(object)}\n\n  Expression\n    ${Printer.print(expression)}\n\n`;

    if (error != null)
      errorMessage += `  ${error}`;

    super(errorMessage);
  }
}
