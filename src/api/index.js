import queryString from 'query-string';

import { config } from 'config';

export const api = async (url, { headers = {}, ...restOptions } = {}) => {
  const requestHeaders = Object.entries({
    'Content-Type': 'application/json',
    ...headers,
  }).reduce((a, [k, v]) => (v == null ? a : { ...a, [k]: v }), {});

  const response = await fetch(`${url}`, {
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

  return api(`${config.apiBaseUrl}${resource}/capacity${queryParams}`, {
    signal: abortController.signal,
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

  return api(`${config.apiBaseUrl}${resource}/fraction${queryParams}`, {
    signal: abortController.signal,
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

  return api(`${config.apiBaseUrl}${resource}/sealed${queryParams}`, {
    signal: abortController.signal,
  });
};

export const fetchMiners = async (abortController, query) => {
  var url = new URL('https://api.repsys.d.interplanetary.one/api/miners');

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return api(
    url, // `https://api.repsys.d.interplanetary.one/api/miners?limit=10&offset=0&order=desc&sortBy=rawPower`,
    {
      signal: abortController.signal,
    }
  );
};
