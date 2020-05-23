declare const _default: {
    camelCase(name: string): string;
    pascalCase(name: string): string;
    kebabCase(name: string): string;
    orderBy<T>(array: T[], keys: string[], directions: ('asc' | 'desc')[]): T[];
};
export default _default;
