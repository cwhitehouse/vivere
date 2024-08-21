import jsep, { ArrayExpression, Identifier } from 'jsep';
import jsepAssignment from '@jsep-plugin/assignment';
import type { AssignmentExpression } from '@jsep-plugin/assignment';
import jsepObject from '@jsep-plugin/object';
import type { ObjectExpression } from '@jsep-plugin/object';
import jsepArrow from '@jsep-plugin/arrow';
import type { ArrowExpression } from '@jsep-plugin/arrow';
import jsepTemplate from '@jsep-plugin/template';
import type { TemplateLiteral } from '@jsep-plugin/template';
import Component from '../components/component';
import EvaluatorError from '../errors/evaluator-error';

interface EvaluatorOptions {
  component: Component;
  local: { [key: string]: unknown },
}

// We need a plugin to properly parse assignment operations
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jsep.plugins.register(jsepAssignment);

// We need a plugin to properly parse object literals
jsep.plugins.register(jsepObject);

// We need a plugin to parse arrow expressions, like
// in array.map(v -> v.something)
jsep.plugins.register(jsepArrow);

// We need a plugin to parse template strings
jsep.plugins.register(jsepTemplate);

// Add a special binary operation that behaves like a
// truncated ternary operation (e.g. boolean ?? action)
jsep.addBinaryOp('??', 0.1);

// Add a special identifier character for referencing components
const componentIdentifier = '*';
jsep.addIdentifierChar(componentIdentifier);

// Enum for special pursposes return values, specifically
// for identifying successful assignments or function calls
enum ParseResult {
  AssignmentExpressionExecuted = 'assignment-expression-executed',
  EmptyExpression = 'empty-expression',
}

// Helper object for wrapping parsing an object, that
// returns the object and the final key to be parsed,
// which is useful for assignments and function calls
class ShallowParseResult {
  object: unknown;

  prop: string;

  optional = false;

  constructor(object: unknown, prop: string, optional?: boolean) {
    this.object = object;
    this.prop = prop;
    if (optional != null) this.optional = optional;
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

const templateLiteralRegex = /^[^`]*\${[^}]+}[^`]*$/;

// Helper method for running eval code (BE CAREFUL!)
const evaluateScript = (script: string, scope: unknown = {}): unknown => {
  return Function(`"use strict"; ${script}`).bind(scope)();
};

const evaluateAssignmentExpression = (caller: unknown, tree: AssignmentExpression, options: EvaluatorOptions): unknown => {
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
    const { object, prop, optional } = calleeValues;

    if (optional && object == null) return object;

    const argsValues = args.map((arg) => evaluateTree(caller, arg, options));
    const returnValue = object[prop](...argsValues);

    if (shallow) return new ShallowCallResult(returnValue);
    return returnValue;
  }

  throw new EvaluatorError('Tried to invoke method on deeply parsed value', caller, type);
};

const evaluateArrowExpression = (caller: unknown, tree: ArrowExpression, options: EvaluatorOptions): unknown => {
  const { body, params, type } = tree;
  const { local } = options;

  return (...args) => {
    args.forEach((arg, idx) => {
      const param = params[idx];

      // We need not define every arg
      // that is available to us
      if (param != null) {
        if (param.type !== 'Identifier')
          throw new EvaluatorError('Arrow expression params should always be identifiers', caller, type);

        local[(param as Identifier).name] = arg;
      }
    });

    return evaluateTree(caller, body, options, false);
  };
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

  // Start by evaluating the left value
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

  // The '\\' operator should not evaluate the right side
  // if the leftValue is true
  if (operator === '||')
    return leftValue
      || evaluateTree(caller, right, options);

  // The '&&' operator should not evaluate the right side
  // if the leftValue is false
  if (operator === '&&')
    return leftValue
      && evaluateTree(caller, right, options);

  // Otherwise, let's parse our right value and see what we're working with!
  const rightValue = evaluateTree(caller, right, options);

  if (assignmentOperators.includes(operator))
    // The assignment evaluator can miss this when the `??` operator is involved
    return evaluateAssignmentExpression(caller, tree as unknown as AssignmentExpression, options);

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

const evaluateObjectExpression = (caller: unknown, tree: ObjectExpression, options: EvaluatorOptions): unknown => {
  const { properties } = tree;
  const object = {};

  properties.forEach((p) => {
    let key: string;
    // Identifiers as object keys are just special string literals
    if (p.key.type === 'Identifier')
      key = p.key.name as string;
    else
      key = evaluateTree(caller, p.key, options, false) as string;

    const value = evaluateTree(caller, p.value, options, false);

    object[key] = value;
  });

  return object;
};

const evaluateArrayExpression = (caller: unknown, tree: ArrayExpression, options: EvaluatorOptions): unknown => {
  const { elements } = tree;

  return elements.map((element) => evaluateTree(caller, element, options));
};

const evaluateMemberExpression = (caller: unknown, tree: jsep.MemberExpression, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { computed, object, optional, property } = tree;

  // Shadlow parse the caller to catch a few special cases
  const $object = evaluateTree(caller, object, options);

  // If it's optional we don't have an $object, let's return our
  // null or undefined value
  if (optional && $object == null) {
    if (shallow) return new ShallowParseResult($object, null, true);
    return $object;
  }

  if (computed) {
    const propKey = evaluateTree(options.component, property, options)?.toString();
    if (shallow)
      return new ShallowParseResult($object, propKey);
    return $object[propKey];
  }

  return evaluateTree($object, property, options, shallow);
};

const evaluateThisExpression = (caller: unknown, tree: jsep.ThisExpression, options: EvaluatorOptions): unknown => {
  return options.component;
};

const evaluateIdentifier = (caller: unknown, tree: jsep.Identifier, options: EvaluatorOptions, shallow: boolean): unknown => {
  const { name } = tree;
  const { component, local } = options;

  // When shallow parsing, an Identifier is our end state that we need
  // to bundle up and return for a function call or assignment expression
  if (shallow)
    return new ShallowParseResult(caller, name);

  // Otherwise...

  // If it's a local variable, we should
  // unwrap it
  if (Object.keys(local).includes(name))
    return local[name];

  // Special case for our component shorthand
  if (name.startsWith(componentIdentifier)) {
    const componentName = name.substring(1);
    return component.$find(componentName);
  }

  return caller[name];
};

const evaluateTemplateLiteral = (caller: unknown, tree: TemplateLiteral, options: EvaluatorOptions): unknown => {
  const { quasis, expressions } = tree;

  let string = '';

  const length = Math.max(quasis.length, expressions.length);
  for (let i = 0; i < length; i += 1) {
    const expression = expressions[i];
    const quasi = quasis[i];

    if (quasi) string += quasi.value.cooked;
    if (expression) string += evaluateTree(caller, expression, options);
  }

  return string;
};

const evaluateLiteral = (tree: jsep.Expression): unknown => tree.value;

const evaluateTree = (caller: unknown, tree: jsep.Expression, options: EvaluatorOptions, shallow = false): unknown => {
  const { type } = tree;

  switch (type) {
    case 'AssignmentExpression':
      return evaluateAssignmentExpression(caller, tree as AssignmentExpression, options);
    case 'CallExpression':
      return evaluateCallExpression(caller, tree as jsep.CallExpression, options, shallow);
    case 'ArrowFunctionExpression':
      return evaluateArrowExpression(caller, tree as ArrowExpression, options);
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
    case 'ObjectExpression':
      return evaluateObjectExpression(caller, tree as ObjectExpression, options);
    case 'ArrayExpression':
      return evaluateArrayExpression(caller, tree as jsep.ArrayExpression, options);
    case 'ThisExpression':
      return evaluateThisExpression(caller, tree as jsep.ThisExpression, options);
    case 'Identifier':
      return evaluateIdentifier(caller, tree as jsep.Identifier, options, shallow);
    case 'TemplateLiteral':
      return evaluateTemplateLiteral(caller, tree as TemplateLiteral, options);
    case 'Literal':
      return evaluateLiteral(tree);
    default:
      throw new EvaluatorError(`Unknown node type: ${type}`, caller, '', null);
  }
};

const parse = (component: Component, expression: string, executing = false, $args: unknown[] = []): unknown => {
  try {
    let $expression = expression;
    if (templateLiteralRegex.test($expression))
      $expression = `\`${$expression}\``;

    const tree = jsep($expression);

    const options: EvaluatorOptions = {
      component,
      local: {
        $arg: $args[0],
        $args,
        JSON,
        Object,
        Math,
      },
    };
    return evaluateTree(component, tree, options, executing);
  } catch (error) {
    throw new EvaluatorError('Failed to parse expression', component, expression, error);
  }
};

export default {
  tree(expression: string): jsep.Expression {
    return jsep(expression);
  },

  assign(component: Component, expression: string, value: unknown): void {
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

    return expression;
  },

  execute(component: Component, expression: string, ...args: unknown[]): unknown {
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

  compute(component: Component, expression: string): unknown {
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
