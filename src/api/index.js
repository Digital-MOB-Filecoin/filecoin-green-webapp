import queryString from 'query-string';

import { config } from 'config';

const api = async (url, { headers = {}, data, ...restOptions } = {}) => {
  const requestHeaders = Object.entries({
    'Content-Type': 'application/json',
    ...headers,
  }).reduce((a, [k, v]) => (v == null ? a : { ...a, [k]: v }), {});

  const response = await fetch(`${config.apiBaseUrl}${url}`, {
    headers: new Headers(requestHeaders),
    mode: 'cors',
    ...restOptions,
  });

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
};

export const fetchCapacity = async (abortController, query) => {
  let resource = 'network';
  let queryParams = '';

  if (query) {
    if (query.miner) {
      resource = 'miner';
    }
    queryParams = `?${queryString.stringify(query)}`;
  }

  return new Promise((resolve, reject) => {
    api(`${resource}/capacity${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) => {
        return data.map(({ date, commited, used }) => ({
          date,
          commited: Number(commited),
          used: Number(used),
        }));
      })
      .then(resolve)
      .catch(reject);
  });
};

export const fetchCSVCapacity = async (abortController, query) => {
  let resource = 'network';
  let queryParams = '';

  if (query) {
    if (query.miner) {
      resource = 'miner';
    }
    queryParams = `?${queryString.stringify(query)}`;
  }

  return new Promise((resolve, reject) => {
    api(`${resource}/capacity${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) => data)
      .then(resolve)
      .catch(reject);
  });
};

export const fetchFraction = async (abortController, query) => {
  let resource = 'network';
  let queryParams = '';

  if (query) {
    if (query.miner) {
      resource = 'miner';
    }
    queryParams = `?${queryString.stringify(query)}`;
  }

  return new Promise((resolve, reject) => {
    api(`${resource}/fraction${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) => {
        return data.map(({ date, fraction }) => ({
          date,
          fraction: Number(fraction),
        }));
      })
      .then(resolve)
      .catch(reject);
  });
};

export const fetchSealed = async (abortController, query) => {
  let resource = 'network';
  let queryParams = '';

  if (query) {
    if (query.miner) {
      resource = 'miner';
    }
    queryParams = `?${queryString.stringify(query)}`;
  }

  return new Promise((resolve, reject) => {
    api(`${resource}/sealed${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) => {
        return data.map(({ date, sealed }) => ({
          date,
          sealed: Number(sealed),
        }));
      })
      .then(resolve)
      .catch(reject);
  });
};
