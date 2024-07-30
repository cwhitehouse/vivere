import VivereError from '../errors/error';
import { Component } from '../vivere';

interface StorageParams {
  key: string;
  type: 'local' | 'session';
}

const getStorage = (params: StorageParams): Storage => {
  const { type } = params;

  switch (type) {
    case 'local':
      return window.localStorage;
    case 'session':
      return window.sessionStorage;
    default:
      throw new VivereError(`Trying to store data in unknown store type: ${type}`);
  }
};

const getStoreKey = (params: StorageParams): string => {
  const { key } = params;
  return `vivere-store-${key}`;
};

const retrieve = (params: StorageParams): unknown => {
  const storeKey = getStoreKey(params);
  const storage = getStorage(params);

  const storedValue = storage.getItem(storeKey);
  if (storedValue == null || storedValue === 'undefined')
    return undefined;

  return JSON.parse(storedValue);
};

const save = (params: StorageParams, value: unknown): void => {
  const storeKey = getStoreKey(params);
  const storage = getStorage(params);

  storage.setItem(storeKey, JSON.stringify(value));
};

const useStorage = (component: Component, params: StorageParams): void => {
  const { key } = params;

  const storedValue = retrieve(params);
  if (storedValue !== undefined)
    component.$set(key, storedValue);

  component.$watch(key, () => {
    // Save the new value
    save(params, component[key]);
  });
};

export { retrieve, save, useStorage };
export type { StorageParams };
