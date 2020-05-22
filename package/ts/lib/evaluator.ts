export default {
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

  assign(object: object, expression: string, value: unknown): void {
    const parts = expression.split('.');

    let $object = object;
    parts.slice(0, -1).forEach((part) => { $object = $object[part]; });

    const key = parts[parts.length - 1];
    $object[key] = value;
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