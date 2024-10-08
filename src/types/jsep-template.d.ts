import jsep, { Expression, IPlugin } from 'jsep';

export const name: string;
export function init(this: typeof jsep): void;

export interface TaggedTemplateExpression extends Expression {
  type: 'TaggedTemplateExpression';
  readonly tag: Expression;
  readonly quasi: TemplateLiteral;
}

export interface TemplateElement extends Expression {
  type: 'TemplateElement';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  value: { cooked: string; raw: string };
  tail: boolean;
}

export interface TemplateLiteral extends Expression {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

declare const _export: IPlugin;
export default _export;
