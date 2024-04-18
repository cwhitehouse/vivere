/* eslint-disable max-classes-per-file */
import jsep from 'jsep';
import jsepAssignment from '@jsep-plugin/assignment';
import VivereComponent from '../components/vivere-component';
import EvaluatorError from '../errors/evaluator-error';

interface EvaluatorOptions {
  component: VivereComponent;
  $args?: unknown[];
}

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

// Helper object for wrapping parsing the response
// of a method call. Useful for wrapping a value
// and allowing us to know it's the result of a
// method call.
class ShallowCallResult {
  value: unknown;

  constructor(value: unknown) {
    this.value = value;
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
let evaluateTree: (caller: unknown, tree: jsep.Expression, options: EvaluatorOptions, shallow?: boolean) => unknown;

const evaluateAssignmentExpression = (caller: unknown, tree: jsepAssignment.AssignmentExpression, options: EvaluatorOptions): unknown => {
  const { left, operator, right, type } = tree;

  // Shallow parse the tree so we can properly execut the assignment
  const leftValue = evaluateTree(caller, left, options, true);

  if (leftValue instanceof ShallowParseResult) {
    const rightValue = evaluateTree(caller, right, options);

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

const evaluateCallExpression = (caller: unknown, tree: jsep.CallExpression, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { callee, type } = tree;
  const args = tree.arguments;

  // Shallow parse the callee so `this` is handled properly on the function call
  const calleeValues = evaluateTree(caller, callee, options, true);

  if (calleeValues instanceof ShallowParseResult) {
    const argsValues = args.map((arg) => evaluateTree(caller, arg, options));

    const returnValue = calleeValues.object[calleeValues.prop](...argsValues);

    if (shallow)
      return new ShallowCallResult(returnValue);

    return returnValue;
  }

  throw new EvaluatorError('Tried to invoke method on deeply parsed value', caller, type);
};

const evaluateCompound = (caller: unknown, tree: jsep.Compound, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { body } = tree;
  return body.map((exp) => evaluateTree(caller, exp, options, shallow));
};

const evaluateConditionalExpression = (caller: unknown, tree: jsep.ConditionalExpression, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { alternate, consequent, test } = tree;

  const testValue = evaluateTree(caller, test, options);

  if (testValue)
    return evaluateTree(caller, consequent, options, shallow);
  return evaluateTree(caller, alternate, options, shallow);
};

const evaluateBinaryExpression = (caller: unknown, tree: jsep.BinaryExpression, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { left, operator, right, type } = tree;

  const leftValue = evaluateTree(caller, left, options);

  // Our custom ?? operator is effectively half a ternary statement
  if (operator === '??')
    if (leftValue)
      // If true, evaluate the right side (shallow if we're trying to execute)
      return evaluateTree(caller, right, options, shallow);
    else if (shallow)
      // If false and shallow, return an empty expression
      return ParseResult.EmptyExpression;
    else
      // If false and deep, this is effectively null
      return null;

  const rightValue = evaluateTree(caller, right, options);

  if (assignmentOperators.includes(operator))
    // The assignment evaluator can miss this when the `??` operator is involved
    return evaluateAssignmentExpression(caller, tree as unknown as jsepAssignment.AssignmentExpression, options);

  if (binaryOperators.includes(operator)) {
    const leftJSON = JSON.stringify(leftValue);
    const rightJSON = JSON.stringify(rightValue);
    return evaluateScript(`return ${leftJSON} ${operator} ${rightJSON}`);
  }

  throw new EvaluatorError(`Unhandled binary operator: ${operator}`, caller, type);
};

const evaluateUnaryExpression = (caller: unknown, tree: jsep.UnaryExpression, options: EvaluatorOptions): unknown => {
  const { argument, operator, type } = tree;
  const argumentValue = evaluateTree(caller, argument, options);

  switch (operator) {
    case '!':
      return !argumentValue;
    default:
      throw new EvaluatorError(`Unhandled unary operator: ${operator}`, caller, type);
  }
};

const evaluateMemberExpression = (caller: unknown, tree: jsep.MemberExpression, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { computed, object, optional, property } = tree;

  const $object = evaluateTree(caller, object, options);
  if (optional && $object == null)
    return null;

  if (computed) {
    const propKey = evaluateTree(options.component, property, options)?.toString();
    if (shallow)
      return new ShallowParseResult($object, propKey);
    return $object[propKey];
  }

  return evaluateTree($object, property, options, shallow);
};

const evaluateIdentifier = (caller: unknown, tree: jsep.Identifier, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { name } = tree;

  if (name === '$args' && options.$args)
    if (shallow)
      throw new EvaluatorError('Cannot shallow parse $args', caller, name);
    else
      return options.$args;

  if (shallow)
    // When shallow parsing, an Identifier is our end state that we need
    // to bundle up and return for a function call or assignment expression
    return new ShallowParseResult(caller, name);

  return caller[name];
};

const evaluateLiteral = (tree: jsep.Expression): unknown => tree.value;

evaluateTree = (caller: unknown, tree: jsep.Expression, options: EvaluatorOptions, shallow = false): unknown => {
  const { type } = tree;

  switch (type) {
    case 'AssignmentExpression':
      return evaluateAssignmentExpression(caller, tree as jsepAssignment.AssignmentExpression, options);
    case 'CallExpression':
      return evaluateCallExpression(caller, tree as jsep.CallExpression, options, shallow);
    case 'Compound':
      return evaluateCompound(caller, tree as jsep.Compound, options, shallow);
    case 'ConditionalExpression':
      return evaluateConditionalExpression(caller, tree as jsep.ConditionalExpression, options, shallow);
    case 'BinaryExpression':
      return evaluateBinaryExpression(caller, tree as jsep.BinaryExpression, options, shallow);
    case 'UnaryExpression':
      return evaluateUnaryExpression(caller, tree as jsep.UnaryExpression, options);
    case 'MemberExpression':
      return evaluateMemberExpression(caller, tree as jsep.MemberExpression, options, shallow);
    case 'Identifier':
      return evaluateIdentifier(caller, tree as jsep.Identifier, options, shallow);
    case 'Literal':
      return evaluateLiteral(tree);
    default:
      throw new EvaluatorError(`Unknown node type: ${type}`, caller, '', null);
  }
};

const parse = (component: VivereComponent, expression: string, executing = false, $args: unknown[] = []): unknown => {
  try {
    const tree = jsep(expression);
    return evaluateTree(component, tree, { component, $args }, executing);
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

  execute(component: VivereComponent, expression: string, ...args: unknown[]): unknown {
    // Shallow parse the expression
    const response = parse(component, expression, true, args);

    // If it looked like an assignment and it was executed, return `undefined`
    if (response === ParseResult.AssignmentExpressionExecuted) return undefined;

    // If it looked like nothing (e.g. the second half of a `??` operator), return null
    if (response === ParseResult.EmptyExpression) return null;

    // If it looked like a function call and it was executed, return the result
    if (response instanceof ShallowCallResult) return response.value;

    // Otherwise, invoke the method on our shallow parser result and return that value
    if (response instanceof ShallowParseResult) {
      const { object: caller, prop: property } = response;
      return caller[property](args);
    }

    if (Array.isArray(response))
      response.forEach((resp) => {
        if (resp instanceof ShallowParseResult) {
          const { object: caller, prop: property } = resp;
          caller[property](args);
        }
      });

    // If it's not a special case response, simply return whatever the response was
    return response;
  },

  compute(component: VivereComponent, expression: string): unknown {
    const response = parse(component, expression, true);

    // We shouldn't allow assignments when parsing computed
    if (response === ParseResult.AssignmentExpressionExecuted) throw new EvaluatorError('Do not assign when computing a property', component, expression);

    // If it looked like nothing (e.g. the second half of a `??` operator), we're done
    if (response === ParseResult.EmptyExpression) return null;

    // If it looked like a function call and it was executed, we're done
    if (response instanceof ShallowCallResult) return response.value;

    // If we're parsing a property on the caller, do that
    if (response instanceof ShallowParseResult) {
      const { object: caller, prop: property } = response;
      return caller[property];
    }

    // Otherwise let's just return whatever we found
    return response;
  },
};
