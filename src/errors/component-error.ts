import VivereError from './error';
import Printer from '../lib/printer';
import VivereComponent from '../components/vivere-component';

export default class ComponentError extends VivereError {
  constructor(message: string, component: VivereComponent, error?: Error) {
    let errorMessage = `${message}

  ${Printer.print(component)}

`;

    if (error != null)
      errorMessage += `  ${error}`;

    super(errorMessage);
  }
}
