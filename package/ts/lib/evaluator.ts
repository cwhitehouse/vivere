import VivereError from '../error';

export default {
  // For event handlers, we can perform basic functions automatically
  // Supported operators:
  //   =
  //   +=
  //   -=

  isAssignmentOperation(expression: string): boolean {
    return expression.match(/^[a-zA-z.-_]+ [+-]= [A-z0-9]$/) != null;
  },

  executeAssignment(object: object, expression: string): void {
    const [lhExp, operator, rhExp] = expression.split(' ');
    const { obj, key } = this.prepareAssign(object, lhExp);
    const value = this.read(object, rhExp);

    switch (operator) {
      case '=':
        obj[key] = value;
        break;
      case '+=':
        obj[key] += value;
        break;
      case '-=':
        obj[key] -= value;
        break;
      default:
        throw new VivereError('Failed to excute assignment, unknown operator!');
    }
  },

  read(object: object, expression: string): unknown {
    let $expression = expression;
    let invert = false;
    if ($expression.startsWith('!')) {
      $expression = $expression.slice(1);
      invert = true;
    }

    let result: unknown = object;
    $expression.split('.').forEach((exp) => { result = result[exp]; });
    if (invert) result = !result;
    return result;
  },

  prepareAssign(object: object, expression: string): { obj: object; key: string } {
    const parts = expression.split('.');

    let $object = object;
    parts.slice(0, -1).forEach((part) => { $object = $object[part]; });

    const key = parts[parts.length - 1];

    return { obj: $object, key };
  },

  assign(object: object, expression: string, value: unknown): void {
    const { obj, key } = this.prepareAssign(object, expression);
    obj[key] = value;
  },

  execute(object: object, expression: string, ...args: unknown[]): void {
    const parts = expression.split('.');

    let $object = object;
    parts.slice(0, -1).forEach((part) => {
      $object = $object[part];
    });

    const key = parts[parts.length - 1];
    $object[key](...args);
  },
};
