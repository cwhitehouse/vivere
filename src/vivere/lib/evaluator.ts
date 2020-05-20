export default {
  read(object: object, expression: string): any {
    let $expression = expression;
    let invert = false;
    if ($expression.startsWith('!')) {
      $expression = $expression.slice(1);
      invert = true;
    }

    let result: any = object;
    $expression.split('.').forEach((exp) => {
      if (exp.endsWith('()')) {
        const fnc = exp.slice(0,-2);
        result = result[fnc]();
      } else {
        result = result[exp];
      }
    });
    if (invert) result = !result;
    return result;
  },

  assign(object: object, expression: string, value: any) {
    const parts = expression.split('.');

    let $object = object;
    parts.slice(0, -1).forEach((part) => {
      $object = $object[part];
    });

    const key = parts[parts.length - 1];
    $object[key] = value;
  },

  execute(object: object, expression: string, args: any) {
    const parts = expression.split('.');

    let $object = object;
    parts.slice(0, -1).forEach((part) => {
      $object = $object[part];
    });

    const key = parts[parts.length - 1];
    $object[key](args);
  },
};
