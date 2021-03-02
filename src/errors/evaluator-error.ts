import Component from '../components/component';
import VivereError from './error';
import Printer from '../lib/printer';

export default class EvaluatorError extends VivereError {
  constructor(message: string, component: Component, expression: string, error?: Error) {
    let errorMessage = `${message}

    ${Printer.print(component)}

    ${Printer.print(expression)}`;

    if (error != null)
      errorMessage += `\n  ${error}`;

    super(errorMessage);
  }
}
