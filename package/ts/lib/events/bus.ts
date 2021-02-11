const listeners: { [key: string]: Set<(...args: unknown[]) => void> } = {};

export default {
  register(event: string, listener: (...args: unknown[]) => void): void {
    if (listeners[event] == null)
      listeners[event] = new Set();

    listeners[event].add(listener);
  },

  deregister(event: string, listener: (...args: unknown[]) => void): void {
    listeners[event]?.delete(listener);
  },

  broadcast(event: string, ...args: unknown[]): void {
    listeners[event]?.forEach((listener) => {
      listener(...args);
    });
  },
};
