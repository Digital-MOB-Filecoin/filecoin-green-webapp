import queryString from 'query-string';

import { config } from 'config';

export type TChartFiler = 'day' | 'week' | 'month';

export const api = async (
  url: string,
  { headers = {}, ...restOptions }: RequestInit = {}
): Promise<any> => {
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
    throw await response?.json();
  }

  return response.json();
};

export type TFetchMinersQuery = {
  limit: number;
  offset: number;
  sortBy?: string | 'power' | 'used';
  order?: string | 'asc' | 'desc';
};
export type TFetchMinersResponseMiners = {
  miner: string;
  power: string;
  used: string;
};
type TFetchMinersResponse = {
  pagination: {
    total: string;
    limit: string;
    offset: string;
  };
  miners: TFetchMinersResponseMiners[];
};
export const fetchMiners = async (
  abortController: AbortController,
  query: TFetchMinersQuery
): Promise<TFetchMinersResponse> => {
  const queryParams = `?${queryString.stringify(query)}`;

  return api(`${config.apiBaseUrl}miners${queryParams}`, {
    signal: abortController.signal,
  });
};

export const fetchChartModels = async (abortController: AbortController) => {
  return api(`${config.apiBaseUrl}models/list`, {
    signal: abortController.signal,
  });
};

type TFetchChartQuery = {
  id: number;
  start: string;
  end: string;
  miner?: string | null;
  filter?: TChartFiler | null;
};
type TFetchChartResponse = {
  id: string;
  code_name: string;
  name: string;
  category: 'energy' | 'capacity';
  x: string;
  y: string;
  version: number;
  filter: TChartFiler;
  data: {
    title: string;
    color: string;
    data: {
      value: string;
      start_date: string;
      end_date: string;
    }[];
  }[];
};
export const fetchChart = async (
  abortController: AbortController,
  query: TFetchChartQuery
): Promise<TFetchChartResponse> => {
  const queryParams = `?${queryString.stringify(query)}`;

  return api(`${config.apiBaseUrl}models/model${queryParams}`, {
    signal: abortController.signal,
  });
};

type TFetchExportDataQuery = {
  id: number;
  offset: number;
  limit: number;
  start: string;
  end: string;
  miner?: string | null;
  filter?: TChartFiler | null;
};
type TFetchExportDataResponse = {
  fields: string[];
  data: Record<string, string>[];
};
export const fetchExportData = async (
  query: TFetchExportDataQuery
): Promise<TFetchExportDataResponse> => {
  const queryParams = `?${queryString.stringify(query)}`;

  return api(`${config.apiBaseUrl}models/export${queryParams}`);
};

export const fetchMinerData = async (minerId: string) => {
  return api(
    `https://api.filrep.io/api/miners?limit=10&offset=0&search=${minerId}`
  );
};

export type TFetchMapChartResponse = {
  country: string;
  storage_providers: string;
};

export const fetchMapChart = async (): Promise<TFetchMapChartResponse[]> => {
  return api(`${config.apiBaseUrl}map/list`);
};

export type TFetchMapChartMarkersResponse = {
  city: string;
  country: string;
  lat: number;
  long: number;
  miner: string;
  power: string;
};
export const fetchMapChartMarkers = async (
  countryCode: string
): Promise<TFetchMapChartMarkersResponse[]> => {
  return api(`${config.apiBaseUrl}map/list/country?country=${countryCode}`);
};

export const fetchMapChartMiner = async (minedId) => {
  return api(`${config.apiBaseUrl}map/list/miner?miner=${minedId}`);
};
