# use-cached-fetch

This is a helper library that builds upon react-async's `useAsync` method to provide a useful asynchronous fetch hook with a shared cache between your components.

Simply wrap a part of your app in a `<PromiseCacheProvider>` and then use the provided `useCachedFetch` hook.

The result is the same result as you would be getting from `useAsync`, so you can use react-async's `Loading`, `Fulfilled`, `Rejected` and `Settled` components with it.  
For convenience, these components are re-exported by this library.

Please note that this library is used for data fetching, not for data submitting (as those calls usually should not be cached). For deferred method calls, please use react-async's `useFetch` directly.