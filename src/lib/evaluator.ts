import EvaluatorError from '../errors/evaluator-error';
import VivereComponent from '../components/vivere-component';

const stringRegex = '\'[^\']*\'|"[^"]*"';
const basicSymbolRegex = `(${stringRegex}|[a-zA-z.\\-_0-9]+)`;
const standardSymbolRegex = `!*${basicSymbolRegex}`;
const complexSymbolRegex = `( ?(&& |\\|\\| )?${standardSymbolRegex})+`;

const isStringRegex = new RegExp(`^${stringRegex}$`);
const isString = (expression: string): boolean => expression.match(isStringRegex) != null;

// const isBasicSymbolRegex = new RegExp(`^${basicSymbolRegex}$`);
// const isBasicSybmol = (expression: string): boolean => expression.match(isBasicSymbolRegex) != null;

// const isStandardSymbolRegex = new RegExp(`^${standardSymbolRegex}$`);
// const isStandardSymbol = (expression: string): boolean => expression.match(isStandardSymbolRegex) != null;

// const isComplexSymbolRegex = new RegExp(`^${complexSymbolRegex}$`);
// const isComplexSymbol = (expression: string): boolean => expression.match(isComplexSymbolRegex) != null;

const assignmentSymbolRegex = '[+-]?=';

const isAssignmentOperationRegex = new RegExp(`^${basicSymbolRegex} ${assignmentSymbolRegex} ${complexSymbolRegex}$`);
const isAssignmentOperation = (expression: string): boolean => expression.match(isAssignmentOperationRegex) != null;

const isExecutionSymbolRegex = new RegExp(`^${basicSymbolRegex}\\(${standardSymbolRegex}?\\)`);
const isExecutionSymbol = (expression: string): boolean => expression.match(isExecutionSymbolRegex) != null;

const comparisonSymbolRegex = '([<>]=?|!==?|===?)';

const isComparisonOperationRegex = new RegExp(`^${complexSymbolRegex} ${comparisonSymbolRegex} ${complexSymbolRegex}$`);
const isComparisonOperation = (expression: string): boolean => expression.match(isComparisonOperationRegex) != null;

const isTernaryOperationRegx = new RegExp(`^${complexSymbolRegex} [?] ${standardSymbolRegex} [:] ${standardSymbolRegex}$`);
const isTernaryExpression = (expression: string): boolean => expression.match(isTernaryOperationRegx) != null;

const $parsePrimitive = (expression: string): unknown => {
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
};

/**
 * Dig into an object chain, passing each subsequent expression
 * part to the object and returning the final value of the chain.
 * @param object A Javascript object to dig into
 * @param expressionParts An array of strings presenting the keys to dig into
 */
const dig = (object: unknown, expressionParts: string[]): unknown => {
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('Evaluator#dig');
  console.log(object);
  console.log(expressionParts);
  console.log('-');
  let result = object;
  for (let i = 0; i < expressionParts.length; i += 1) {
    // Read the next part in our object property chain
    let part = expressionParts[i];
    const isNullConditional = part.endsWith('?');

    // If we have a null conditional operater, remove the '?' at the end
    if (isNullConditional)
      part = part.slice(0, -1);

    // Parse the value
    result = result[part];

    console.log(result);

    if (isNullConditional && result == null) {
      console.log('returning null...');
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
      // If this part is null conditional and the value is null,
      // we just return null!
      return null;
    }
  }
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  return result;
};

/**
 * Gets a value from an object, by parsing a Directive expression
 * as an object chain, an digging into the object
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const read = (object: unknown, expression: string): unknown => {
  let $expression = expression;
  let inversions = 0;
  while ($expression.startsWith('!')) {
    $expression = $expression.slice(1);
    inversions += 1;
  }

  const parts = $expression.split('.');
  let result = dig(object, parts);
  for (let i = 0; i < inversions; i += 1)
    result = !result;

  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('Evaluator#read');
  console.log(expression);
  console.log(parts);
  console.log(result);
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

  return result;
};

/**
 * Parse an expression passed to a Directive, determining
 * whether it represents a number, string, boolean or an
 * object chain.
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const $parse = (object: unknown, expression: string): unknown => {
  if (isTernaryExpression(expression)) {
    const [temp, elseValue] = expression.split(' : ');
    const [comparison, ifValue] = temp.split(' ? ');

    const $comparison = comparison;
    let $boolean = false;
    if (isComparisonOperation($comparison))
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      $boolean = $evaluateComparison(object, $comparison);
    else
      $boolean = !!$parse(object, $comparison);

    return $boolean
      ? $parse(object, ifValue)
      : $parse(object, elseValue);
  }

  // Strings can have spaces, so try parsing
  // as a string before we treat is a complex expression
  if (isString(expression)) {
    const primitive = $parsePrimitive(expression);
    if (primitive !== undefined) return primitive;
  }

  const parts = expression.split(' ');
  if (parts.length > 1) {
    // Spaces imply we're chaining values with && and || operators
    let result = $parse(object, parts[0]);
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const exp = parts[i + 1];
      const value = $parse(object, exp);

      if (operator === '&&')
        result = result && value;
      else if (operator === '||')
        result = result || value;
      else
        throw new Error(`Failed to parse unknown operator: ${operator}`);
    }

    return result;
  }

  const primitive = $parsePrimitive(expression);
  if (primitive !== undefined) return primitive;

  return read(object, expression);
};

/**
 * Evaluates a comparison operation based on a Directive
 * expression representing a comparison, on the object
 * Supports ==, !=, ===, !==, >, >=, <, <=
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const $evaluateComparison = (object: unknown, expression: string): boolean => {
  const splitRegex = new RegExp(` ${comparisonSymbolRegex} `);

  const [lhExp, operator, rhExp] = expression.split(splitRegex);
  const lhValue = $parse(object, lhExp);
  const rhValue = $parse(object, rhExp);

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
      throw new EvaluatorError(`Failed to evaluate unknown operator: ${operator}`, object, expression, null);
  }
};

/**
 * Digs  into the object most of the way, and then
 * returning the penultimate value and the final
 * key, allowing assignment to the final key.
 * @param object A Javascript object to dig into
 * @param expression An expression passed to a Directive via an HTML attribute
 */
const digShallow = (object: unknown, expression: string): { obj: unknown; key: string } => {
  const parts = expression.split('.');

  const $object = dig(object, parts.slice(0, -1));
  const key = parts[parts.length - 1];

  return { obj: $object, key };
};

// Core API...

export default {
  /**
   * Determine whether a Directive's expression represents
   * assignment to a value, e.g. =, += or push-ing to an array.
   * @param expression An expression passed to a Directive via an HTML attribute
   */
  isAssignmentOperation,

  /**
   * Executes an assignment operation based on a Directive
   * expression representing the operation, on the object.
   * Supports =, +=, or -=
   * @param object A Javascript object to dig into
   * @param expression An expression passed to a Directive via an HTML attribute
   */
  executeAssignment(component: VivereComponent, expression: string): void {
    const [lhExp, operator, ...rhExp] = expression.split(' ');
    const { obj, key } = digShallow(component, lhExp);

    let $rhExp = rhExp.join(' ');
    let inversions = 0;
    while ($rhExp.startsWith('!')) {
      $rhExp = $rhExp.slice(1);
      inversions += 1;
    }
    let value = $parse(component, $rhExp);
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
          throw new EvaluatorError(`Operator only applies to numbers: "${operator}"`, component, expression, null);

        obj[key] -= value;
        break;
      default:
        throw new EvaluatorError(`Failed to parse unknown operator: "${operator}"`, component, expression, null);
    }
  },

  /**
 * Determine whether a Directive's expression represents
 * comparison between values, i.e. ==, !=, ===, !==, >, >=, <, <=
 * @param expression
 */
  isComparisonOperation,

  evaluateComparison(component: VivereComponent, expression: string): boolean {
    try {
      return $evaluateComparison(component, expression);
    } catch (err) {
      throw new EvaluatorError('Failed to evaluate comparison expression', component, expression, err);
    }
  },

  // Reading, writing, and executing expressions

  read,

  parsePrimitive(component: VivereComponent, expression: string): unknown {
    try {
      return $parsePrimitive(expression);
    } catch (err) {
      throw new EvaluatorError('Failed to parse expression', component, expression, err);
    }
  },

  parse(component: VivereComponent, expression: string): unknown {
    try {
      return $parse(component, expression);
    } catch (err) {
      throw new EvaluatorError('Failed to parse expression', component, expression, err);
    }
  },

  /**
   * Evaluates a Directive expression, and then assigns a value
   * to the result of object chain described by the Directive
   * expression
   * @param object A Javascript object to dig into
   * @param expression An expression passed to a Directive via an HTML attribute
   * @param value The value we want to assign
   */
  assign(component: VivereComponent, expression: string, value: unknown): void {
    try {
      const { obj, key } = digShallow(component, expression);
      obj[key] = value;
    } catch (err) {
      throw new EvaluatorError('Failed to assign value', component, expression, err);
    }
  },

  /**
   * Evalutes a Directive expression, than invokes the last
   * part of the object chain described by the Directive expression
   * as a function with the given args
   * @param object A Javascript object to dig into
   * @param expression An expression passed to a Directive via an HTML attribute
   * @param args The value we want to assign
   */
  execute(component: VivereComponent, expression: string, ...args: unknown[]): void {
    let $expression: string;
    let obj: unknown;
    let key: string;

    try {
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
      console.log('Evaluator#execute');
      console.log(expression);

      // Check to see if this expression looks like a ternary expression
      const [firstPart, secondPart, thirdPart] = expression.split(/ [?:] /);

      console.log('-');
      console.log(firstPart);
      console.log(secondPart);
      console.log(thirdPart);

      if (secondPart != null) {
        // If we have a ? separating some parts
        // e.g. boolean ? doSomething
        // e.g. boolean ? doSomething : doSomethingElse
        const result = read(component, firstPart);

        console.log('-');
        console.log(result);

        if (result)
          // If true, we evaluate the secondPart as the execution expression
          // e.g. true ? doSomething
          $expression = secondPart;
        else if (thirdPart != null)
          // If we have a third part, evaluate it as the execution expression
          // e.g. false ? doSomething : doSomethingElse
          $expression = thirdPart;
        else {
          console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
          // Return and do nothing if we don't have a third part of this expression
          // e.g. false ? doSomething
          return;
        }
      } else
        $expression = firstPart;

      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

      // Get the final object we're executing a method on, and the
      // key representing the method we're going to execute
      ({ obj, key } = digShallow(component, $expression));

      // If we've passed an arg, we need to extract and parse it
      if (isExecutionSymbol(key)) {
        const [method, $argString] = key.split('(');
        const $args = $argString.slice(0, -1).split(',').map((s) => $parse(component, s.trim()));

        obj[method](...$args);
      } else
        // Otherwise we can just pass the default args
        obj[key](...args);
    } catch (err) {
      throw new EvaluatorError('Failed to execute expression', component, expression, err);
    }
  },
};
