import { TChartFiler } from 'api';

export const QUERY_DATE_FORMAT = 'yyyy-MM-dd'; // date-fns format

export const CHART_SCALE: {
  title: string;
  queryKey: TChartFiler;
  isDefault?: boolean;
}[] = [
    {
      title: 'Day',
      queryKey: 'day',
      isDefault: true,
    },
    {
      title: 'Week',
      queryKey: 'week',
    },
    {
      title: 'Month',
      queryKey: 'month',
    },
  ];

export const STATIC_END_DATE = new Date('2026-06-14');

export type TIntervalKey = '1m' | '3m' | '6m' | '1y' | '3y' | '5y';

export const INTERVALS: {
  label: string;
  key: TIntervalKey;
  start: string;
}[] = [
    { label: '1 month', key: '1m', start: '2026-05-14' },
    { label: '3 months', key: '3m', start: '2026-03-14' },
    { label: '6 months', key: '6m', start: '2025-12-14' },
    { label: '1 year', key: '1y', start: '2025-06-14' },
    { label: '3 years', key: '3y', start: '2023-06-14' },
    { label: '5 years', key: '5y', start: '2021-06-14' },
  ];

export const DEFAULT_INTERVAL: TIntervalKey = '6m';
