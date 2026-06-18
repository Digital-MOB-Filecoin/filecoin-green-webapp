import { lightFormat as dateLightFormat } from 'date-fns';

import { QUERY_DATE_FORMAT } from 'constant';

export function encodeDateToQueryDate(date: Date | number): string {
  return dateLightFormat(date, QUERY_DATE_FORMAT);
}

export function prepareUtcDateForFormatting(dateInUtcString: string): Date {
  return new Date(
    new Date(dateInUtcString).setMinutes(
      new Date(dateInUtcString).getMinutes() + new Date(dateInUtcString).getTimezoneOffset(),
    ),
  );
}
