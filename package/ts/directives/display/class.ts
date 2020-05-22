import DisplayDirective from './display';
import VivereError from '../../error';

export default class ClassDirective extends DisplayDirective {
  static id = 'v-class';

  // Parsing

  parse(): void {
    if (this.key == null) throw new VivereError('Class directive requires a key');
  }


  // Evaluation

  evaluateValue(value: unknown): void {
    if (value) this.element.classList.add(this.key);
    else this.element.classList.remove(this.key);
  }
}