import VivereError from './error';
import Printer from '../lib/printer';
import Directive from '../directives/directive';

export default class DirectiveError extends VivereError {
  constructor(message: string, directive: Directive, error?: Error) {
    let errorMessage = `${message}\n\n  ${Printer.print(directive.component)}\n\n  ${Printer.print(directive, [], ['key', 'modifiers', 'expression'])}\n\n`;

    if (error != null) errorMessage += `  ${error}`;

    super(errorMessage);
  }
}
