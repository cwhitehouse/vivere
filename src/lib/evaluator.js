export default {
  evaluate(source, expression) {
    let $expression = expression;
    let invert = false;
    if ($expression.startsWith('!')) {
      $expression = $expression.slice(1);
      invert = true;
    }

    let result = source;
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
};
