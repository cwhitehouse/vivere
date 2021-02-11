const listeners = {};
export default {
    register(event, listener) {
        if (listeners[event] == null)
            listeners[event] = new Set();
        listeners[event].add(listener);
    },
    deregister(event, listener) {
        listeners[event]?.delete(listener);
    },
    broadcast(event, ...args) {
        listeners[event]?.forEach((listener) => {
            listener(...args);
        });
    },
};
