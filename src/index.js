import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { GeneralProvider } from 'context/general';

import App from 'components/App';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <GeneralProvider>
      <Router>
        <QueryParamProvider ReactRouterRoute={Route}>
          <App />
        </QueryParamProvider>
      </Router>
    </GeneralProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
