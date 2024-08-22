import VivereError from './error';
import Printer from '../lib/printer';
import Component from '../components/component';

export default class ComponentError extends VivereError {
  constructor(message: string, component: Component, error?: Error) {
    let errorMessage = `${message}\n\n  ${Printer.print(component)}\n\n`;

    if (error != null) errorMessage += `  ${error}`;

    super(errorMessage);
  }
}
