import jsep from 'jsep';
import VivereComponent from '../components/vivere-component';
import jsepAssignment from '@jsep-plugin/assignment';
import EvaluatorError from '../errors/evaluator-error';

jsep.plugins.register(jsepAssignment);

enum ParseResult {
  CallExpressionExecuted,
  AssignmentExpressionExecuted
};

class ShadllowParseResult {
  object: any;
  prop: string;

  constructor(object: any, prop: string) {
    this.object = object;
    this.prop = prop;
  }
}

let evaluateTree: (caller: any, tree: jsep.Expression, shallow?: boolean) => any;

const evaluateAssignmentExpression = (caller: any, tree: jsepAssignment.AssignmentExpression): any => {
  const { left, operator, right, type } = tree;

  const leftValue = evaluateTree(caller, left, true);

  if (leftValue instanceof ShadllowParseResult) {
    const rightValue = evaluateTree(caller, right);

    switch (operator) {
      case '=':
        leftValue.object[leftValue.prop] = rightValue;
        break;
      case '+=':
        leftValue.object[leftValue.prop] += rightValue;
        break;
      case '-=':
        leftValue.object[leftValue.prop] -= rightValue;
        break;
      default:
        throw new EvaluatorError(`Unhandled assignment expression: ${operator}`, caller, type);
    }
  } else
    throw new EvaluatorError('Tried to assign to deeply parsed value', caller, type);

  return ParseResult.AssignmentExpressionExecuted;
}

const evaluateCallExpression = (caller: any, tree: jsep.CallExpression): any => {
  const { callee, type } = tree;
  const args = tree.arguments;

  const calleeValues = evaluateTree(caller, callee, true);

  if (calleeValues instanceof ShadllowParseResult) {
    const argsValues = args.map(arg => evaluateTree(caller, arg));

    calleeValues.object[calleeValues.prop](...argsValues);

    return ParseResult.CallExpressionExecuted;
  }

  throw new EvaluatorError('Tried to invoke method on deeply parsed value', caller, type);
};

const evaluateConditionalExpression = (caller: any, tree: jsep.ConditionalExpression): any => {
  const { alternate, consequent, test } = tree;

  const testValue = evaluateTree(caller, test);

  if (testValue)
    return evaluateTree(caller, consequent);
  else
    return evaluateTree(caller, alternate);
}

const evaluateBinaryExpression = (caller: any, tree: jsep.BinaryExpression): any => {
  const { left, operator, right, type } = tree;

  const leftValue = evaluateTree(caller, left);
  const rightValue = evaluateTree(caller, right);

  switch (operator) {
    case '==':
      // eslint-disable-next-line eqeqeq
      return leftValue == rightValue;
    case '===':
      return leftValue === rightValue;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return leftValue != rightValue;
    case '!==':
      return leftValue !== rightValue;
    case '>':
      return leftValue > rightValue;
    case '>=':
      return leftValue >= rightValue;
    case '<':
      return leftValue < rightValue;
    case '<=':
      return leftValue <= rightValue;
    case '&&':
      return leftValue && rightValue;
    case '||':
      return leftValue || rightValue;
    default:
      throw new EvaluatorError(`Unhandled conditional operator: ${operator}`, caller, type);
  }
};

const evaluateUnaryExpression = (caller: any, tree: jsep.UnaryExpression): any => {
  const { argument, operator, type } = tree;
  const argumentValue = evaluateTree(caller, argument);

  switch (operator) {
    case '!':
      return !argumentValue;
    default:
      throw new EvaluatorError(`Unhandled unary operator: ${operator}`, caller, type);
  }
};

const evaluateMemberExpression = (caller: any, tree: jsep.MemberExpression, shallow = false): any => {
  const { object, optional, property } = tree;

  const $object = evaluateTree(caller, object);
  if (optional && $object == null)
    return null;

  return evaluateTree($object, property, shallow);
};

const evaluateIdentifier = (caller: any, tree: jsep.Identifier, shallow = false): any => {
  const { name } = tree;

  if (shallow)
    return new ShadllowParseResult(caller, name);

  return caller[name];
};

const evaluateLiteral = (tree: jsep.Expression): any => {
  const value = tree.value;
  return value;
};

evaluateTree = (caller: any, tree: jsep.Expression, shallow = false): any => {
  const { type } = tree;

  switch (type) {
    case 'AssignmentExpression':
      return evaluateAssignmentExpression(caller, tree as jsepAssignment.AssignmentExpression);
    case 'CallExpression':
      return evaluateCallExpression(caller, tree as jsep.CallExpression);
    case 'ConditionalExpression':
      return evaluateConditionalExpression(caller, tree as jsep.ConditionalExpression);
    case 'BinaryExpression':
      return evaluateBinaryExpression(caller, tree as jsep.BinaryExpression);
    case 'UnaryExpression':
      return evaluateUnaryExpression(caller, tree as jsep.UnaryExpression);
    case 'MemberExpression':
      return evaluateMemberExpression(caller, tree as jsep.MemberExpression, shallow);
    case 'Identifier':
      return evaluateIdentifier(caller, tree as jsep.Identifier, shallow);
    case 'Literal':
      return evaluateLiteral(tree);
    default:
      throw new EvaluatorError(`Unknown node type: ${type}`, caller, '', null);
  }
};

const parse = (component: VivereComponent, expression: string, executing = false): any => {
  try {
    const tree = jsep(expression);
    return evaluateTree(component, tree, executing);
  } catch (error) {
    throw new EvaluatorError('Failed to parse expression', component, expression, error);
  }
};

export default {
  assign(component: VivereComponent, expression: string, value: any): void {
    const result = parse(component, expression, true);

    if (result instanceof ShadllowParseResult) {
      const { object: caller, prop: property } = result;
      caller[property] = value;
    } else
      throw new EvaluatorError('Cannot assign to deeply parsed expression', component, expression);
  },

  parse,

  parsePrimitive(component: VivereComponent, expression: string) {
    // Check if the expression is a number
    const number = Number(expression);
    if (!Number.isNaN(number)) return number;

    // Check if expression is a boolean
    if (expression === 'true') return true;
    if (expression === 'false') return false;

    // Check if expression is null
    if (expression === 'null') return null;
    if (expression === 'undefined') return null;

    // Check if the expression is a string (with quotes)
    if (expression.match(/^(('.*')|(".*"))$/))
      return expression.slice(1, expression.length - 1);

    return undefined;
  },

  execute(component: VivereComponent, expression: string, ...args: unknown[]): void {
    const response = parse(component, expression, true);
    if (response === ParseResult.AssignmentExpressionExecuted) return;
    if (response === ParseResult.CallExpressionExecuted) return;

    if (response instanceof ShadllowParseResult) {
      const { object: caller, prop: property } = response;
      caller[property](args);
    } else
      throw new EvaluatorError('Tried to invoke method on a deeply parsed value', component, expression);
  },
};
