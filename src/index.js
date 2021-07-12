import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { GeneralProvider } from 'context/general';

import App from 'components/App';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <GeneralProvider>
      <BrowserRouter>
        <QueryParamProvider ReactRouterRoute={Route}>
          <App />
        </QueryParamProvider>
      </BrowserRouter>
    </GeneralProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
