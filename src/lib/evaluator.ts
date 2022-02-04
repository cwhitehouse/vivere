import jsep from 'jsep';
import jsepAssignment from '@jsep-plugin/assignment';
import VivereComponent from '../components/vivere-component';
import EvaluatorError from '../errors/evaluator-error';

// We need a plugin to properly parse assignment operations
jsep.plugins.register(jsepAssignment);

// Enum for special pursposes return values, specifically
// for identifying successful assignments or function calls
enum ParseResult {
  CallExpressionExecuted,
  AssignmentExpressionExecuted,
}

// Helper object for wrapping parsing an object, that
// returns the object and the final key to be parsed,
// which is useful for assignments and function calls
class ShallowParseResult {
  object: unknown;

  prop: string;

  constructor(object: unknown, prop: string) {
    this.object = object;
    this.prop = prop;
  }
}

// Define our generic evaluation method so it can be used in our specific methods
let evaluateTree: (caller: unknown, tree: jsep.Expression, shallow?: boolean) => unknown;

const evaluateAssignmentExpression = (caller: unknown, tree: jsepAssignment.AssignmentExpression): unknown => {
  const { left, operator, right, type } = tree;

  // Shallow parse the tree so we can properly execut the assignment
  const leftValue = evaluateTree(caller, left, true);

  if (leftValue instanceof ShallowParseResult) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rightValue = evaluateTree(caller, right) as any;

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
};

const evaluateCallExpression = (caller: unknown, tree: jsep.CallExpression): unknown => {
  const { callee, type } = tree;
  const args = tree.arguments;

  // Shallow parse the callee so `this` is handled properly on the function call
  const calleeValues = evaluateTree(caller, callee, true);

  if (calleeValues instanceof ShallowParseResult) {
    const argsValues = args.map((arg) => evaluateTree(caller, arg));

    calleeValues.object[calleeValues.prop](...argsValues);

    return ParseResult.CallExpressionExecuted;
  }

  throw new EvaluatorError('Tried to invoke method on deeply parsed value', caller, type);
};

const evaluateConditionalExpression = (caller: unknown, tree: jsep.ConditionalExpression): unknown => {
  const { alternate, consequent, test } = tree;

  const testValue = evaluateTree(caller, test);

  if (testValue)
    return evaluateTree(caller, consequent);
  return evaluateTree(caller, alternate);
};

const evaluateBinaryExpression = (caller: unknown, tree: jsep.BinaryExpression): unknown => {
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

const evaluateUnaryExpression = (caller: unknown, tree: jsep.UnaryExpression): unknown => {
  const { argument, operator, type } = tree;
  const argumentValue = evaluateTree(caller, argument);

  switch (operator) {
    case '!':
      return !argumentValue;
    default:
      throw new EvaluatorError(`Unhandled unary operator: ${operator}`, caller, type);
  }
};

const evaluateMemberExpression = (caller: unknown, tree: jsep.MemberExpression, shallow = false): unknown => {
  const { object, optional, property } = tree;

  const $object = evaluateTree(caller, object);
  if (optional && $object == null)
    return null;

  return evaluateTree($object, property, shallow);
};

const evaluateIdentifier = (caller: unknown, tree: jsep.Identifier, shallow = false): unknown => {
  const { name } = tree;

  if (shallow)
    // When shallow parsing, an Identifier is our end state that we need
    // to bundle up and return for a function call or assignment expression
    return new ShallowParseResult(caller, name);

  return caller[name];
};

const evaluateLiteral = (tree: jsep.Expression): unknown => tree.value;

evaluateTree = (caller: unknown, tree: jsep.Expression, shallow = false): unknown => {
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

const parse = (component: VivereComponent, expression: string, executing = false): unknown => {
  try {
    const tree = jsep(expression);
    return evaluateTree(component, tree, executing);
  } catch (error) {
    throw new EvaluatorError('Failed to parse expression', component, expression, error);
  }
};

export default {
  assign(component: VivereComponent, expression: string, value: unknown): void {
    // Shallow parse the expression (left side of the assignment)
    const result = parse(component, expression, true);

    if (result instanceof ShallowParseResult) {
      const { object: caller, prop: property } = result;
      caller[property] = value;
    } else
      throw new EvaluatorError('Cannot assign to deeply parsed expression', component, expression);
  },

  parse,

  parsePrimitive(expression: string): unknown {
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
    // Shallow parse the expression
    const response = parse(component, expression, true);

    // If it looked like an assignment and it was executed, we're done
    if (response === ParseResult.AssignmentExpressionExecuted) return;

    // If it looked like a function call and it was executed, we're done
    if (response === ParseResult.CallExpressionExecuted) return;

    // Otherwise, invoke the method on our shallow parser result
    if (response instanceof ShallowParseResult) {
      const { object: caller, prop: property } = response;
      caller[property](args);
    } else
      throw new EvaluatorError('Tried to invoke method on a deeply parsed value', component, expression);
  },
};
