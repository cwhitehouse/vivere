import VivereError from '../error';

/**
   * Determine whether a Directive's expression represents
   * comparison between values, i.e. ==, !=, ===, !==, >, >=, <, <=
   * @param expression
   */
const isComparisonOperation = (expression: string): boolean => expression.match(/^!*[a-zA-z.-_]+ ([<>]=?|!==?|===?) !*[A-z0-9.-_'"]+$/) != null;

/**
 * Determine where a Directive's expression represents
 * a ternary expression
 * @param expression
 */
const isTernaryExpression = (expression: string): boolean => expression.match(/^!*[a-zA-z.-_]+( ([<>]=?|!==?|===?) !*[A-z0-9.-_'"]+)? [?] !*[a-zA-z.-_'"]+ [:] !*[a-zA-z.-_'"]+$/) != null;

/**
 * Parse an expression passed to a Directive, determining
 * whether it represents a number, string, boolean or an
 * object chain.
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const parse = (object: object, expression: string): unknown => {
  // Check if the expression is a number
  const number = Number(expression);
  if (!Number.isNaN(number)) return number;

  // Check if expression is a boolean
  if (expression === 'true') return true;
  if (expression === 'false') return false;

  // Check if expression is null
  if (expression === 'null') return null;

  // Check if the expression is a string (with quotes)
  if (expression.match(/^(('.*')|(".*"))$/))
    return expression.slice(1, expression.length - 1);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return read(object, expression);
};

/**
 * Evaluates a comparison operation based on a Directive
 * expression representing a comparison, on the object
 * Supports ==, !=, ===, !==, >, >=, <, <=
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const evaluateComparison = (object: object, expression: string): boolean => {
  const [lhExp, operator, rhExp] = expression.split(' ');
  const lhValue = parse(object, lhExp);
  const rhValue = parse(object, rhExp);

  switch (operator) {
    case '==':
      // eslint-disable-next-line eqeqeq
      return lhValue == rhValue;
    case '===':
      return lhValue === rhValue;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return lhValue != rhValue;
    case '!==':
      return lhValue !== rhValue;
    case '>':
      return lhValue > rhValue;
    case '>=':
      return lhValue >= rhValue;
    case '<':
      return lhValue < rhValue;
    case '<=':
      return lhValue <= rhValue;
    default:
      throw new VivereError('Failed to evaluate comparison, unknown operator!');
  }
};

/**
 * Dig into an object chain, passing each subsequent expression
 * part to the object and returning the final value of the chain.
 * @param object A Javascript object to dig into
 * @param expressionParts An array of strings presenting the keys to dig into
 */
const dig = (object: object, expressionParts: string[]): unknown => {
  let result = object;
  expressionParts.forEach((part) => { result = result[part]; });
  return result;
};

/**
 * Gets a value from an object, by parsing a Directive expression
 * as an object chain, an digging into the object
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const read = (object: object, expression: string): unknown => {
  if (isTernaryExpression(expression)) {
    const [temp, elseValue] = expression.split(' : ');
    const [comparison, ifValue] = temp.split(' ? ');

    const $comparison = comparison;
    let $boolean = false;
    if (isComparisonOperation($comparison))
      $boolean = evaluateComparison(object, $comparison);
    else
      $boolean = !!parse(object, $comparison);

    return $boolean
      ? parse(object, ifValue)
      : parse(object, elseValue);
  }

  let $expression = expression;
  let invert = false;
  if ($expression.startsWith('!')) {
    $expression = $expression.slice(1);
    invert = true;
  }

  const parts = $expression.split('.');
  let result = dig(object, parts);
  if (invert) result = !result;
  return result;
};

/**
 * Digs  into the object most of the way, and then
 * returning the penultimate value and the final
 * key, allowing assignment to the final key.
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const digShallow = (object: object, expression: string): { obj: unknown; key: string } => {
  const parts = expression.split('.');

  const $object = dig(object, parts.slice(0, -1));
  const key = parts[parts.length - 1];

  return { obj: $object, key };
};


// Core API...

export default {
  // Handling some basic code besides object chains...

  // Supported operators:
  //   =
  //   +=
  //   -=

  /**
   * Determine whether a Directive's expression represents
   * assignment to a value, e.g. =, += or push-ing to an array.
   * @param expression An expression passed to a Directive via an HTML attribute
   */
  isAssignmentOperation(expression: string): boolean {
    return expression.match(/^[a-zA-z.-_]+ [+-]?= !*[A-z0-9.-_'"]+$/) != null;
  },

  /**
   * Executes an assignment operation based on a Directive
   * expression representing the operation, on the object.
   * Supports =, +=, or -=
   * @param object A Javascript object to dig into
   * @param expression An expression passed to a Directive via an HTML attribute
   */
  executeAssignment(object: object, expression: string): void {
    const [lhExp, operator, rhExp] = expression.split(' ');
    const { obj, key } = digShallow(object, lhExp);

    let $rhExp = rhExp;
    let inversions = 0;
    while ($rhExp.startsWith('!')) {
      $rhExp = $rhExp.slice(1);
      inversions += 1;
    }
    let value = parse(object, $rhExp);
    for (let i = 0; i < inversions; i += 1)
      value = !value;


    switch (operator) {
      case '=':
        obj[key] = value;
        break;
      case '+=':
        obj[key] += value;
        break;
      case '-=':
        if (typeof value !== 'number')
          throw new VivereError('Can only perform -= operation on numbers');

        obj[key] -= value;
        break;
      default:
        throw new VivereError('Failed to excute assignment, unknown operator!');
    }
  },

  isComparisonOperation,

  evaluateComparison,


  // Reading, writing, and executing expressions

  read,

  /**
   * Evaluates a Directive expression, and then assigns a value
   * to the result of object chain described by the Directive
   * expression
   * @param object A Javascript object to dig into
   * @param expression An expression passed to a Directive via an HTML attribute
   * @param value The value we want to assign
   */
  assign(object: object, expression: string, value: unknown): void {
    const { obj, key } = digShallow(object, expression);
    obj[key] = value;
  },

  /**
   * Evalutes a Directive expression, than invokes the last
   * part of the object chain described by the Directive expression
   * as a function with the given args
   * @param object A Javascript object to dig into
   * @param expression An expression passed to a Directive via an HTML attribute
   * @param args The value we want to assign
   */
  execute(object: object, expression: string, ...args: unknown[]): void {
    const { obj, key } = digShallow(object, expression);
    obj[key](...args);
  },
};
