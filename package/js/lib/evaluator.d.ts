declare const _default: {
    /**
     * Determine whether a Directive's expression represents
     * assignment to a value, e.g. =, += or push-ing to an array.
     * @param expression An expression passed to a Directive via an HTML attribute
     */
    isAssignmentOperation(expression: string): boolean;
    /**
     * Executes an assignment operation based on a Directive
     * expression representing the operation, on the object.
     * Supports =, +=, or -=
     * @param object A Javascript object to dig into
     * @param expression An expression passed to a Directive via an HTML attribute
     */
    executeAssignment(object: object, expression: string): void;
    isComparisonOperation: (expression: string) => boolean;
    evaluateComparison: (object: object, expression: string) => boolean;
    read: (object: object, expression: string) => unknown;
    /**
     * Evaluates a Directive expression, and then assigns a value
     * to the result of object chain described by the Directive
     * expression
     * @param object A Javascript object to dig into
     * @param expression An expression passed to a Directive via an HTML attribute
     * @param value The value we want to assign
     */
    assign(object: object, expression: string, value: unknown): void;
    /**
     * Evalutes a Directive expression, than invokes the last
     * part of the object chain described by the Directive expression
     * as a function with the given args
     * @param object A Javascript object to dig into
     * @param expression An expression passed to a Directive via an HTML attribute
     * @param args The value we want to assign
     */
    execute(object: object, expression: string, ...args: unknown[]): void;
};
export default _default;
