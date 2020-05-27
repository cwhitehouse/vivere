declare const _default: {
    isAssignmentOperation(expression: string): boolean;
    executeAssignment(object: object, expression: string): void;
    read(object: object, expression: string): unknown;
    prepareAssign(object: object, expression: string): {
        obj: object;
        key: string;
    };
    assign(object: object, expression: string, value: unknown): void;
    execute(object: object, expression: string, ...args: unknown[]): void;
};
export default _default;
