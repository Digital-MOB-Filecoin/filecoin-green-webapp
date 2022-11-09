import sub from 'date-fns/sub';

export const EPOCH_START_TIMESTAMP = 1598281200000; // ms
export const EPOCH_DURATION = 30000; // ms
export const CHART_SCALE = [
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

export const MAX_DATEPICKER_DATE = sub(new Date(), { days: 2 });

export const DEFAULT_DATEPICKER_START_DATE = new Date(2020, 7, 24);

export const DEFAULT_DATEPICKER_END_DATE = MAX_DATEPICKER_DATE;

export const defaultDataState = {
  results: [],
  loading: false,
  failed: false,
};
