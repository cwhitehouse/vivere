import VivereError from './error';
import Printer from '../lib/printer';
import Directive from '../directives/directive';

export default class DirectiveError extends VivereError {
  constructor(message: string, directive: Directive, error?: Error) {
    let errorMessage = `${message}

    ${Printer.print(directive.component)}

    ${Printer.print(directive)}`;

    if (error != null)
      errorMessage += `\n  ${error}`;

    super(errorMessage);
  }
}
