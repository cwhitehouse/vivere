import VivereError from '../error';
export default {
    // For event handlers, we can perform basic functions automatically
    // Supported operators:
    //   =
    //   +=
    //   -=
    isAssignmentOperation(expression) {
        return expression.match(/^[a-zA-z.-_]+ [+-]= [A-z0-9]$/) != null;
    },
    executeAssignment(object, expression) {
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
    prepareAssign(object, expression) {
        const parts = expression.split('.');
        let $object = object;
        parts.slice(0, -1).forEach((part) => { $object = $object[part]; });
        const key = parts[parts.length - 1];
        return { obj: $object, key };
    },
    assign(object, expression, value) {
        const { obj, key } = this.prepareAssign(object, expression);
        obj[key] = value;
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
