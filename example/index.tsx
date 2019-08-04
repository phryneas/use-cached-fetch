import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PromiseCacheProvider, useCachedFetch } from '../src/index';
import { useAsync, Async } from 'react-async';
import { string } from 'prop-types';

const App = () => {
  return (
    <PromiseCacheProvider>
      <div>
        <ComponentA />
        {/*
        <ComponentA />
        <ComponentA />
        */}
      </div>
    </PromiseCacheProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

function buildPromise() {
  return new Promise(resolve => {
    console.log('promise started');
    setTimeout(() => {
      console.log('promise resolved');
      resolve();
    }, 2000);
  });
}

function ComponentA() {
  console.log('render');
  const result = useCachedFetch<{ id: string; joke: string; status: number }>(
    'https://icanhazdadjoke.com/',
    {
      headers: {
        accept: 'application/json',
        // would send this as requested by icanhazdadjokes, but CORS forbids it
        // "user-agent": "use-cached-fetch example (https://github.com/phryneas/use-cached-fetch)"
      },
    }
  );
  const { isLoading, isResolved, reload, data } = result;

  if (isLoading) {
    return <>loading...</>;
  }
  if (isResolved) {
    return (
      <>
        {data!.joke} <br />
        <button onClick={reload}>retry</button>
        <br />
      </>
    );
  }
  return <>wtf</>;
}
