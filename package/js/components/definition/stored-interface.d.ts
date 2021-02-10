export interface StoredInterface {
    key: string;
    version: number;
    defaultValue: (string | number | boolean | (() => (string | number | boolean)));
    type: ('local' | 'session');
}
