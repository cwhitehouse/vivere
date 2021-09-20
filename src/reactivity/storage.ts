import StoredInterface from '../components/definition/stored-interface';
import VivereError from '../errors/error';

const getStorage = (definition: StoredInterface): Storage => {
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

const getStoreKey = (key: string, definition: StoredInterface): string => {
  const { modifier } = definition;

  let { version } = definition;
  version = version || 0;

  let storeKey = `vivere-store-v${version}-${key}`;
  if (modifier != null)
    storeKey = `${storeKey}-${modifier}`;

  return storeKey;
};

export default {
  retrieve(key: string, definition: StoredInterface): unknown {
    const storeKey = getStoreKey(key, definition);
    const storage = getStorage(definition);

    const storedValue = storage.getItem(storeKey);
    if (storedValue == null || storedValue === 'undefined')
      return undefined;

    return JSON.parse(storedValue);
  },

  save(key: string, definition: StoredInterface, value: unknown): void {
    const storeKey = getStoreKey(key, definition);
    const storage = getStorage(definition);

    storage.setItem(storeKey, JSON.stringify(value));
  },
};
