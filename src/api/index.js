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
  const queryParams = query ? `?${queryString.stringify(query)}` : '';

  return new Promise((resolve, reject) => {
    api(`network/capacity${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) =>
        resolve(
          data.map(({ epoch, commited, used }) => ({
            epoch: Number(epoch),
            commited: Number(commited),
            used: Number(used),
          }))
        )
      )
      .catch(reject);
  });
};

export const fetchFraction = async (abortController, query) => {
  const queryParams = query ? `?${queryString.stringify(query)}` : '';

  return new Promise((resolve, reject) => {
    api(`network/fraction${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) =>
        resolve(
          data.map(({ epoch, fraction }) => ({
            epoch: Number(epoch),
            fraction: Number(fraction),
          }))
        )
      )
      .catch(reject);
  });
};

export const fetchSealed = async (abortController, query) => {
  const queryParams = query ? `?${queryString.stringify(query)}` : '';

  return new Promise((resolve, reject) => {
    api(`network/sealed${queryParams}`, {
      signal: abortController.signal,
    })
      .then((data) =>
        resolve(
          data.map(({ epoch, sealed }) => ({
            epoch: Number(epoch),
            sealed: Number(sealed),
          }))
        )
      )
      .catch(reject);
  });
};
