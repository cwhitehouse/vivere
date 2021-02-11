declare const _default: {
    register(event: string, listener: (...args: unknown[]) => void): void;
    deregister(event: string, listener: (...args: unknown[]) => void): void;
    broadcast(event: string, ...args: unknown[]): void;
};
export default _default;
