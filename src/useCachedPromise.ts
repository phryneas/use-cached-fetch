import * as React from 'react';
import { PromiseCacheContext } from './Context';

export function useCachedPromise<T>(cacheKey: string, init: () => Promise<T>) {
  const cache = React.useContext(PromiseCacheContext);
  if (!cache) {
    throw new Error('must be called with a context');
  }

  let resolveInitialPromise = React.useRef<
    undefined | ((value: Promise<T> | T) => any)
  >();
  const [value, updateValue] = React.useState<Promise<T>>(
    new Promise(resolve => {
      resolveInitialPromise.current = resolve;
    })
  );

  React.useEffect(() => {
    const subscription = cache.subscribe(cacheKey, init, updateValue);

    if (resolveInitialPromise.current) {
      resolveInitialPromise.current(subscription.currentValue);
      resolveInitialPromise.current = undefined;
    } else {
      updateValue(subscription.currentValue);
    }

    return subscription.unsubscribe;
  }, [cacheKey]);

  return { value, updateValue: cache.updateItem.bind(cache, cacheKey) };
}
