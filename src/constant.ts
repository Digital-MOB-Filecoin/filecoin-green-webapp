import sub from 'date-fns/sub';

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

export const MAX_DATEPICKER_DATE: Date | number = sub(new Date(), {
  days: 3,
});

export const DEFAULT_DATEPICKER_END_DATE = MAX_DATEPICKER_DATE;

export const DEFAULT_DATEPICKER_START_DATE = sub(MAX_DATEPICKER_DATE, { months: 6 });
