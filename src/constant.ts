import sub from 'date-fns/sub';

import { TChartFiler } from './api';

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
  days: 2,
});
