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
export const fetchMiners = async ({
  abortController,
  data,
}: {
  abortController: AbortController;
  data: TFetchMinersQuery;
}): Promise<TFetchMinersResponse> => {
  const queryParams = `?${queryString.stringify(data)}`;

  return api(`${config.apiBaseUrl}miners${queryParams}`, {
    signal: abortController?.signal,
  });
};

export const fetchChartModels = async ({
  abortController,
}: {
  abortController: AbortController;
}) => {
  return api(`${config.apiBaseUrl}models/list`, {
    signal: abortController?.signal,
  });
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
export const fetchChart = async ({
  abortController,
  data,
}: {
  abortController: AbortController;
  data: {
    id: number;
    start: string;
    end: string;
    miner?: string | null;
    filter?: TChartFiler | null;
    country?: string | null;
  };
}): Promise<TFetchChartResponse> => {
  const queryParams = `?${queryString.stringify(data)}`;

  return api(`${config.apiBaseUrl}models/model${queryParams}`, {
    signal: abortController?.signal,
  });
};

type TFetchExportDataResponse = {
  fields: string[];
  data: Record<string, string>[];
};
export const fetchExportData = async ({
  abortController,
  data,
}: {
  abortController: AbortController;
  data: {
    id: number;
    offset: number;
    limit: number;
    start: string;
    end: string;
    miner?: string | null;
    filter?: TChartFiler | null;
  };
}): Promise<TFetchExportDataResponse> => {
  const queryParams = `?${queryString.stringify(data)}`;

  return api(`${config.apiBaseUrl}models/export${queryParams}`, {
    signal: abortController?.signal,
  });
};

export const fetchMinerData = async ({
  abortController,
  data,
}: {
  abortController: AbortController;
  data: { miner: string };
}): Promise<any> => {
  return api(
    `https://api.filrep.io/api/miners?limit=10&offset=0&search=${data.miner}`,
    { signal: abortController?.signal }
  );
};

export type TFetchMapChartCountries = {
  country: string;
  storage_providers: string;
};

export const fetchMapChartCountries = async ({
  abortController,
}: {
  abortController: AbortController;
}): Promise<TFetchMapChartCountries[]> => {
  return api(`${config.apiBaseUrl}map/list`, {
    signal: abortController?.signal,
  });
};

export type TFetchMapChartCountryMiners = {
  city: string;
  country: string;
  lat: number;
  long: number;
  miner: string;
  power: string;
};
export const fetchMapChartCountryMiners = async ({
  abortController,
  data,
}: {
  abortController: AbortController;
  data: { country: string };
}): Promise<TFetchMapChartCountryMiners[]> => {
  return api(`${config.apiBaseUrl}map/list/country?country=${data.country}`, {
    signal: abortController?.signal,
  });
};

export type TFetchMapChartMinerMarkers = {
  miner: string;
  country: string;
  city: string;
  lat: number;
  long: number;
  power: string;
};

export const fetchMapChartMinerMarkers = async ({
  abortController,
  data,
}: {
  abortController: AbortController;
  data: { miner: string };
}): Promise<TFetchMapChartMinerMarkers[]> => {
  return api(`${config.apiBaseUrl}map/list/miner?miner=${data.miner}`, {
    signal: abortController?.signal,
  });
};
