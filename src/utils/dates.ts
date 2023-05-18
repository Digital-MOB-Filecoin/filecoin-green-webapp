import {
  getTime as dateGetTime,
  isValid as dateIsValid,
  lightFormat as dateLightFormat,
  parse as dateParse,
} from 'date-fns';

import {
  DEFAULT_DATEPICKER_END_DATE,
  DEFAULT_DATEPICKER_START_DATE,
  QUERY_DATE_FORMAT,
} from 'constant';

export function parseIntervalFromQuery(
  start: string | null | undefined,
  end: string | null | undefined,
): Interval {
  const parsedStartDate = start
    ? dateParse(start, QUERY_DATE_FORMAT, new Date()).getTime()
    : undefined;

  const parsedEndDate = end ? dateParse(end, QUERY_DATE_FORMAT, new Date()).getTime() : undefined;

  if (
    !parsedStartDate ||
    !parsedEndDate ||
    !dateIsValid(parsedStartDate) ||
    !dateIsValid(parsedEndDate)
  ) {
    return {
      start: dateGetTime(DEFAULT_DATEPICKER_START_DATE),
      end: dateGetTime(DEFAULT_DATEPICKER_END_DATE),
    };
  }

  if (parsedStartDate > parsedEndDate) {
    return {
      start: dateGetTime(parsedEndDate),
      end: dateGetTime(parsedStartDate),
    };
  }

  return {
    start: dateGetTime(parsedStartDate),
    end: dateGetTime(parsedEndDate),
  };
}

export function encodeDateToQueryDate(date: Date | number): string {
  return dateLightFormat(date, QUERY_DATE_FORMAT);
}
