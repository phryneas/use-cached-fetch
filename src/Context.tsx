import { ICache, Cache, CacheOptions } from './Cache';
import * as React from 'react';

export const PromiseCacheContext = React.createContext<ICache<
  Promise<any>
> | null>(null);
export function PromiseCacheProvider({
  lifetime = 600,
  children,
}: Partial<CacheOptions> & {
  children: any;
}) {
  const [cache] = React.useState(() => new Cache<Promise<any>>({ lifetime }));
  return (
    <PromiseCacheContext.Provider value={cache}>
      {children}
    </PromiseCacheContext.Provider>
  );
}
