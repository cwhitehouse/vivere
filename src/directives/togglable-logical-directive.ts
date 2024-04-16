import Directive from './directive';
import { LogicalDirective } from './logical';

export default class TogglableLogicalDirective implements LogicalDirective {
  $shouldEvaluate = false;
  $dirty = false;

  logicalAncestor?: LogicalDirective;

  awaitingRender: Set<Directive> = new Set();

  constructor(shouldEvaluate: boolean, logicalDescendant: LogicalDirective) {
    this.logicalAncestor = logicalDescendant;
    this.$shouldEvaluate = shouldEvaluate;
  }

  setShouldEvaluate(shouldEvaluate: boolean): void {
    this.$shouldEvaluate = shouldEvaluate;
    if (this.$shouldEvaluate)
      this.awaitingRender.forEach((d) => {
        d.component?.$queueRender(d);
        this.awaitingRender.delete(d);
      });
  }

  shouldEvaluate(): boolean {
    return this.$shouldEvaluate;
  }
}
