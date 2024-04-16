import Directive from './directive';

interface LogicalDirective {
  $dirty: boolean;

  logicalAncestor?: LogicalDirective;

  awaitingRender: Set<Directive>;

  shouldEvaluate(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
const isLogicalDirective = (arg: any): arg is LogicalDirective => 'shouldEvaluate' in arg;

export { LogicalDirective, isLogicalDirective };
