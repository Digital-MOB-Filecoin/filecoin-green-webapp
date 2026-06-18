export type TChartFiler = 'day' | 'week' | 'month';

export type TChartModel = {
  id: number;
  name: string;
  code_name: string;
  category: 'capacity' | 'energy';
  details: string;
};

export const fetchChartModels = async (_opts?: {
  abortController: AbortController;
}): Promise<TChartModel[]> => {
  const response = await fetch('/data/models-list.json');
  return response.json();
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
  data,
}: {
  abortController?: AbortController;
  data: {
    id?: number;
    code_name?: string;
    start?: string;
    end?: string;
    miners?: (string | null)[] | null;
    filter?: TChartFiler | null;
    country?: string | null;
    interval?: string | null;
  };
}): Promise<TFetchChartResponse> => {
  const filter = data.filter || 'day';
  const interval = data.interval || '6m';
  const response = await fetch(`/data/model-${data.id}-${filter}-${interval}.json`);
  return response.json();
};

export type TFetchMapChartCountries = {
  country: string;
  storage_providers: string;
  emissions_intensity: string;
  emissions: string;
  power: string;
};

export const fetchMapChartCountries = async (_opts?: {
  abortController: AbortController;
}): Promise<TFetchMapChartCountries[]> => {
  const response = await fetch('/data/map-list.json');
  return response.json();
};

export type TFetchMapChartCountryMiners = {
  city: string;
  country: string;
  lat: number;
  long: number;
  miner: string;
  power: string;
};

export const fetchMapChartCountryMiners = async (_opts?: unknown): Promise<TFetchMapChartCountryMiners[]> => {
  return [];
};

export type TFetchMapChartMinerMarkers = {
  miner: string;
  country: string;
  city: string;
  lat: number;
  long: number;
  power: string;
};

export const fetchMapChartMinerMarkers = async (_opts?: unknown): Promise<TFetchMapChartMinerMarkers[]> => {
  return [];
};

export type TFetchMinersResponseMiners = {
  miner: string;
  power: string;
  used: string;
};

export const fetchMiners = async (_opts?: unknown): Promise<{
  pagination: { total: string; limit: string; offset: string };
  miners: TFetchMinersResponseMiners[];
}> => {
  return { pagination: { total: '0', limit: '0', offset: '0' }, miners: [] };
};

export const fetchExportDataHeader = async (_opts?: unknown): Promise<Record<string, string>[]> => {
  return [];
};

export const fetchExportData = async (_opts?: unknown): Promise<{
  fields: string[];
  data: Record<string, string>[];
}> => {
  return { fields: [], data: [] };
};
