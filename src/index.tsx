import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

import App from 'components/App';

import './index.css';

// polyfill
import 'wicg-inert';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <QueryParamProvider adapter={ReactRouter5Adapter}>
        <App />
      </QueryParamProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
