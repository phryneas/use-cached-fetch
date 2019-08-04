import * as React from 'react';

import { useAsync, AsyncState } from 'react-async';
import { useCachedPromise } from './useCachedPromise';

function isHeaders(headers: HeadersInit): headers is Headers {
  return 'get' in headers;
}

export function useCachedFetch<Data>(
  input: RequestInfo,
  init: RequestInit
): AsyncState<Data> {
  const headers: any =
    (typeof input !== 'string' && input.headers) ||
    (init && init.headers) ||
    {};
  const accept =
    (isHeaders(headers) && headers.get('accept')) ||
    headers['Accept'] ||
    headers['accept'];
  const cacheKey = JSON.stringify({ input, init });
  const buildPromise = React.useCallback(() => {
    return fetch(input, init).then(
      async (res): Promise<Data> => {
        if (!res.ok) throw res;
        return accept === 'application/json' ? res.json() : res;
      }
    );
  }, [cacheKey]);
  const { value: promise, updateValue } = useCachedPromise(
    cacheKey,
    buildPromise
  );
  const reload = React.useCallback(() => updateValue(buildPromise()), [
    buildPromise,
  ]);
  return { ...useAsync({ promise }), reload };
}
