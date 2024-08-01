import { Component } from '../vivere';

interface QueryEncodingParams {
  dataKey: string;
  encodingKey?: string;
}

const getEncodingKey = (params: QueryEncodingParams): string => {
  const { dataKey, encodingKey } = params;
  return encodingKey || dataKey;
};

const retrieve = (params: QueryEncodingParams): unknown => {
  const encodingKey = getEncodingKey(params);

  const queryParams = new URLSearchParams(window.location.search);
  const encodedValue = queryParams.get(encodingKey);

  if (encodedValue == null || encodedValue === 'undefined')
    return undefined;
  return JSON.parse(encodedValue);
};

const save = (params: QueryEncodingParams, value: unknown): void => {
  const encodingKey = getEncodingKey(params);

  const queryParams = new URLSearchParams(window.location.search);
  queryParams.delete(encodingKey);
  queryParams.append(encodingKey, JSON.stringify(value));

  // eslint-disable-next-line no-restricted-globals
  history.replaceState(null, '', `?${queryParams.toString()}`);
};

const useQueryEncoding = (component: Component, params: QueryEncodingParams): void => {
  const { dataKey } = params;

  const encodedValue = retrieve(params);
  if (encodedValue !== undefined)
    component.$set(dataKey, encodedValue);

  component.$watch(dataKey, () => {
    // Save the new value
    save(params, component[dataKey]);
  });
};

export { retrieve, save, useQueryEncoding };
export type { QueryEncodingParams };
