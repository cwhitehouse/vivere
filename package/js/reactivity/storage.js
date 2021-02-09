import VivereError from '../error';
const getStorage = (definition) => {
    const { type } = definition;
    switch (type) {
        case 'local':
            return window.localStorage;
        case 'session':
            return window.sessionStorage;
        default:
            throw new VivereError(`Trying to store data in unknown store type: ${type}`);
    }
};
const getStoreKey = (key, definition) => {
    let { version } = definition;
    if (version == null)
        version = 0;
    return `vivere-store-v${version}-${key}`;
};
export default {
    retrieve(key, definition) {
        const storeKey = getStoreKey(key, definition);
        const storage = getStorage(definition);
        const storedValue = storage.getItem(storeKey);
        if (storedValue == null)
            return undefined;
        return JSON.parse(storedValue);
    },
    save(key, definition, value) {
        const storeKey = getStoreKey(key, definition);
        const storage = getStorage(definition);
        storage.setItem(storeKey, JSON.stringify(value));
    },
};
