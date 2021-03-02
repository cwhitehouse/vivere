import Component from '../components/component';
import VivereError from './error';
import Printer from '../lib/printer';

export default class ComponentError extends VivereError {
  constructor(message: string, component: Component, error?: Error) {
    let errorMessage = `${message}

  ${Printer.print(component)}
`;

    if (error != null)
      errorMessage += `  ${error}`;

    super(errorMessage);
  }
}
