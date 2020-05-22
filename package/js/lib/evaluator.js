export default {
    read(object, expression) {
        let $expression = expression;
        let invert = false;
        if ($expression.startsWith('!')) {
            $expression = $expression.slice(1);
            invert = true;
        }
        let result = object;
        $expression.split('.').forEach((exp) => { result = result[exp]; });
        if (invert)
            result = !result;
        return result;
    },
    assign(object, expression, value) {
        const parts = expression.split('.');
        let $object = object;
        parts.slice(0, -1).forEach((part) => { $object = $object[part]; });
        const key = parts[parts.length - 1];
        $object[key] = value;
    },
    execute(object, expression, ...args) {
        const parts = expression.split('.');
        let $object = object;
        parts.slice(0, -1).forEach((part) => {
            $object = $object[part];
        });
        const key = parts[parts.length - 1];
        $object[key](...args);
    },
};
