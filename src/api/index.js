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

export const fetchMiners = async (abortController, query) => {
  const queryParams = `?${queryString.stringify(query)}`;

  return api(`${config.apiBaseUrl}miners${queryParams}`, {
    signal: abortController.signal,
  });
};

export const fetchChartModels = async (abortController) => {
  return api(`${config.apiBaseUrl}models/list`, {
    signal: abortController.signal,
  });
};

export const fetchChart = async (abortController, query) => {
  const queryParams = `?${queryString.stringify(query)}`;

  return api(`${config.apiBaseUrl}models/model${queryParams}`, {
    signal: abortController.signal,
  });
};

export const fetchExportData = async (query) => {
  const queryParams = `?${queryString.stringify(query)}`;

  return api(`${config.apiBaseUrl}models/export${queryParams}`);
};

export const fetchMinerData = async (minerId) => {
  return api(
    `https://api.filrep.io/api/miners?limit=10&offset=0&search=${minerId}`
  );
};

export const fetchSearchMapList = async (abortController) => {
  return api(`${config.apiBaseUrl}map/list`, {
    signal: abortController?.signal,
  });
};
