import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  DelimitedArrayParam,
  NumberParam,
  ObjectParam,
  QueryParamProvider,
  StringParam,
} from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
// polyfill
import 'wicg-inert';

import App from 'components/App';

import './index.css';

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <Router>
      <QueryParamProvider
        adapter={ReactRouter6Adapter}
        options={{
          params: {
            charts: ObjectParam,
            miners: DelimitedArrayParam,
            start: StringParam,
            end: StringParam,
            limit: NumberParam,
            offset: NumberParam,
            sortBy: StringParam,
            order: StringParam,
          },
          searchStringToObject: (str) => {
            const searchParams = new URLSearchParams(str);
            const result = {};

            for (const [key, value] of searchParams.entries()) {
              const normalizedKey = key.toLowerCase();
              let normalizedValue = value;

              if (normalizedKey === 'miners') {
                normalizedValue = normalizedValue.replace(/[^f_\d]/g, '');
              }

              result[normalizedKey] = normalizedValue;
            }
            return result;
          },
        }}
      >
        <App />
      </QueryParamProvider>
    </Router>
    , ,
  </React.StrictMode>,
);
