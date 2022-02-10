import jsep from 'jsep';
import jsepAssignment from '@jsep-plugin/assignment';
import VivereComponent from '../components/vivere-component';
import EvaluatorError from '../errors/evaluator-error';

// We need a plugin to properly parse assignment operations
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jsep.plugins.register(jsepAssignment);

// Add a special binary operation that behaves like a
// truncated ternary operation (e.g. boolean ?? action)
jsep.addBinaryOp('??', 0.1);

// Enum for special pursposes return values, specifically
// for identifying successful assignments or function calls
enum ParseResult {
  CallExpressionExecuted,
  AssignmentExpressionExecuted,
  EmptyExpression,
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

// Operators used in assignment expressions
const assignmentOperators = [
  '=', '*=', '**=',
  '/=', '%=',
  '+=', '-=',
  '<<=', '>>=', '>>>=',
  '&=', '^=', '|=',
];

// Operators used in binary expressions
const binaryOperators = [
  '||', '&&', '|', '^', '&',
  '==', '!=', '===', '!==',
  '<', '>', '<=', '>=', '<<', '>>', '>>>',
  '+', '-', '*', '/', '%',
];

// Helper method for running eval code (BE CAREFUL!)
// eslint-disable-next-line arrow-body-style
const evaluateScript = (script: string, scope: unknown = {}): unknown => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return Function(`"use strict"; ${script}`).bind(scope)();
};

// Define our generic evaluation method so it can be used in our specific methods
let evaluateTree: (component: VivereComponent, caller: unknown, tree: jsep.Expression, shallow?: boolean) => unknown;

const evaluateAssignmentExpression = (component: VivereComponent, caller: unknown, tree: jsepAssignment.AssignmentExpression): unknown => {
  const { left, operator, right, type } = tree;

  // Shallow parse the tree so we can properly execut the assignment
  const leftValue = evaluateTree(component, caller, left, true);

  if (leftValue instanceof ShallowParseResult) {
    const rightValue = evaluateTree(component, caller, right);

    if (assignmentOperators.includes(operator)) {
      const propJSON = JSON.stringify(leftValue.prop);
      const valueJSON = JSON.stringify(rightValue);
      evaluateScript(`this[${propJSON}] ${operator} ${valueJSON}`, leftValue.object);
    } else
      throw new EvaluatorError(`Unhandled assignment expression: ${operator}`, caller, type);
  } else
    throw new EvaluatorError('Tried to assign to deeply parsed value', caller, type);

  return ParseResult.AssignmentExpressionExecuted;
};

const evaluateCallExpression = (component: VivereComponent, caller: unknown, tree: jsep.CallExpression): unknown => {
  const { callee, type } = tree;
  const args = tree.arguments;

  // Shallow parse the callee so `this` is handled properly on the function call
  const calleeValues = evaluateTree(component, caller, callee, true);

  if (calleeValues instanceof ShallowParseResult) {
    const argsValues = args.map((arg) => evaluateTree(component, caller, arg));

    calleeValues.object[calleeValues.prop](...argsValues);

    return ParseResult.CallExpressionExecuted;
  }

  throw new EvaluatorError('Tried to invoke method on deeply parsed value', caller, type);
};

const evaluateConditionalExpression = (component: VivereComponent, caller: unknown, tree: jsep.ConditionalExpression): unknown => {
  const { alternate, consequent, test } = tree;

  const testValue = evaluateTree(component, caller, test);

  if (testValue)
    return evaluateTree(component, caller, consequent);
  return evaluateTree(component, caller, alternate);
};

const evaluateBinaryExpression = (component: VivereComponent, caller: unknown, tree: jsep.BinaryExpression, shallow = false): unknown => {
  const { left, operator, right, type } = tree;

  const leftValue = evaluateTree(component, caller, left);

  // Our custom ?? operator is effectively half a ternary statement
  if (operator === '??')
    if (leftValue)
      // If true, evaluate the right side (shallow if we're trying to execute)
      return evaluateTree(component, caller, right, shallow);
    else if (shallow)
      // If false and shallow, return an empty expression
      return ParseResult.EmptyExpression;
    else
      // If false and deep, this is effectively null
      return null;

  const rightValue = evaluateTree(component, caller, right);

  if (assignmentOperators.includes(operator))
    // The assignment evaluator can miss this when the `??` operator is involved
    return evaluateAssignmentExpression(component, caller, tree as unknown as jsepAssignment.AssignmentExpression);

  if (binaryOperators.includes(operator)) {
    const leftJSON = JSON.stringify(leftValue);
    const rightJSON = JSON.stringify(rightValue);
    return evaluateScript(`return ${leftJSON} ${operator} ${rightJSON}`);
  }

  throw new EvaluatorError(`Unhandled binary operator: ${operator}`, caller, type);
};

const evaluateUnaryExpression = (component: VivereComponent, caller: unknown, tree: jsep.UnaryExpression): unknown => {
  const { argument, operator, type } = tree;
  const argumentValue = evaluateTree(component, caller, argument);

  switch (operator) {
    case '!':
      return !argumentValue;
    default:
      throw new EvaluatorError(`Unhandled unary operator: ${operator}`, caller, type);
  }
};

const evaluateMemberExpression = (component: VivereComponent, caller: unknown, tree: jsep.MemberExpression, shallow = false): unknown => {
  const { computed, object, optional, property } = tree;

  const $object = evaluateTree(component, caller, object);
  if (optional && $object == null)
    return null;

  if (computed) {
    const propKey = evaluateTree(component, component, property)?.toString();
    if (shallow)
      return new ShallowParseResult($object, propKey);
    return $object[propKey];
  }

  return evaluateTree(component, $object, property, shallow);
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

evaluateTree = (component: VivereComponent, caller: unknown, tree: jsep.Expression, shallow = false): unknown => {
  const { type } = tree;

  switch (type) {
    case 'AssignmentExpression':
      return evaluateAssignmentExpression(component, caller, tree as jsepAssignment.AssignmentExpression);
    case 'CallExpression':
      return evaluateCallExpression(component, caller, tree as jsep.CallExpression);
    case 'ConditionalExpression':
      return evaluateConditionalExpression(component, caller, tree as jsep.ConditionalExpression);
    case 'BinaryExpression':
      return evaluateBinaryExpression(component, caller, tree as jsep.BinaryExpression, shallow);
    case 'UnaryExpression':
      return evaluateUnaryExpression(component, caller, tree as jsep.UnaryExpression);
    case 'MemberExpression':
      return evaluateMemberExpression(component, caller, tree as jsep.MemberExpression, shallow);
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
    return evaluateTree(component, component, tree, executing);
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

    // If it looked like nothing (e.g. the second half of a `??` operator), we're done
    if (response === ParseResult.EmptyExpression) return;

    // Otherwise, invoke the method on our shallow parser result
    if (response instanceof ShallowParseResult) {
      const { object: caller, prop: property } = response;
      caller[property](args);
    } else
      throw new EvaluatorError('Tried to invoke method on a deeply parsed value', component, expression);
  },
};
