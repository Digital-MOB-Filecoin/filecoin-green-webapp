import { useState, useRef, useMemo, useEffect } from 'react';
import cn from 'classnames';
import outy from 'outy';

import format from 'date-fns/format';
import DICD from 'date-fns/differenceInCalendarDays';
import DICM from 'date-fns/differenceInCalendarMonths';
import sub from 'date-fns/sub';
import isValid from 'date-fns/isValid';

import { Svg } from 'components/Svg';

import { DateRangePicker } from './DateRangePicker';
import s from './s.module.css';

const RANGES = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  HALF_YEAR: 'half_year',
  YEAR: 'year',
  CUSTOM: 'custom',
};

/**
 *
 * @param {Object} params
 * @param {string} [params.className]
 * @param {Object} params.dateInterval
 * @param {Function} params.onChange
 * @returns {JSX.Element}
 */
export const Datepicker = ({ className, dateInterval, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [calendarDateInterval, setCalendarDateInterval] = useState(
    dateInterval
  );
  const wrapRef = useRef(null);
  const outyRef = useRef(null);

  const activeRange = useMemo(() => {
    if (isCustomRangeOpen) return RANGES.CUSTOM;

    if (DICD(dateInterval.end, dateInterval.start) === 7) {
      return RANGES.WEEK;
    }
    if (DICM(dateInterval.end, dateInterval.start) === 1) {
      return RANGES.MONTH;
    }
    if (DICM(dateInterval.end, dateInterval.start) === 3) {
      return RANGES.QUARTER;
    }
    if (DICM(dateInterval.end, dateInterval.start) === 6) {
      return RANGES.HALF_YEAR;
    }
    if (DICM(dateInterval.end, dateInterval.start) === 12) {
      return RANGES.YEAR;
    }

    setIsCustomRangeOpen(true);
  }, [isOpen, isCustomRangeOpen]);

  const keyboardHandler = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', keyboardHandler, false);
      outyRef.current = outy([wrapRef.current], ['click', 'touchend'], () =>
        setIsOpen(false)
      );
    }

    return () => {
      document.removeEventListener('keydown', keyboardHandler, false);
      if (outyRef.current && outyRef.current.remove) {
        outyRef.current.remove();
      }
    };
  }, [isOpen]);

  const handlerSetRange = (range) => {
    let newStartDate = calendarDateInterval.start;
    let newEndDate = sub(new Date(), { days: 1 });

    switch (range) {
      case RANGES.WEEK:
        newStartDate = sub(new Date(), { weeks: 1, days: 1 });
        break;
      case RANGES.MONTH:
        newStartDate = sub(new Date(), { months: 1, days: 1 });
        break;
      case RANGES.QUARTER:
        newStartDate = sub(new Date(), { months: 3, days: 1 });
        break;
      case RANGES.HALF_YEAR:
        newStartDate = sub(new Date(), { months: 6, days: 1 });
        break;
      case RANGES.YEAR:
        newStartDate = sub(new Date(), { years: 1, days: 1 });
        break;
      case RANGES.CUSTOM:
        newEndDate = calendarDateInterval.end;
        break;
      default:
        return;
    }

    setCalendarDateInterval({ start: newStartDate, end: newEndDate });
    onChange({ start: newStartDate, end: newEndDate });
    setIsCustomRangeOpen(false);
    setIsOpen(false);
  };

  const handlerClear = () => {
    setCalendarDateInterval(dateInterval);
  };

  useEffect(() => {
    handlerClear();
  }, [dateInterval.start.getTime(), dateInterval.end.getTime()]);

  return (
    <div className={cn(s.wrap, className)} ref={wrapRef}>
      <Svg id="calendar" className={s.iconCalendar} />
      <button
        onClick={() => setIsOpen((prevState) => !prevState)}
        className={cn(s.button, { [s.active]: isOpen })}
      >
        {isValid(dateInterval.start)
          ? format(dateInterval.start, 'LLL d, yyyy')
          : '--'}
        <span className={s.dateSeparator}>-</span>
        {isValid(dateInterval.end)
          ? format(dateInterval.end, 'LLL d, yyyy')
          : '--'}
      </button>
      <Svg
        id="dropdown-arrow-down"
        className={cn(s.iconArrow, { [s.rotate]: isOpen })}
      />
      <div className={cn(s.datePickerWrap, { [s.active]: isOpen })}>
        <div className={s.calendarsWrap}>
          {isCustomRangeOpen ? (
            <DateRangePicker
              interval={calendarDateInterval}
              onChange={setCalendarDateInterval}
            />
          ) : null}
          <div className={s.rangeWrap}>
            <button
              className={cn(s.rangeButton, {
                [s.active]: activeRange === RANGES.WEEK,
              })}
              type="button"
              onClick={() => handlerSetRange(RANGES.WEEK)}
            >
              7 days
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: activeRange === RANGES.MONTH,
              })}
              type="button"
              onClick={() => handlerSetRange(RANGES.MONTH)}
            >
              30 days
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: activeRange === RANGES.QUARTER,
              })}
              type="button"
              onClick={() => handlerSetRange(RANGES.QUARTER)}
            >
              3 months
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: activeRange === RANGES.HALF_YEAR,
              })}
              type="button"
              onClick={() => handlerSetRange(RANGES.HALF_YEAR)}
            >
              6 months
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: activeRange === RANGES.YEAR,
              })}
              type="button"
              onClick={() => handlerSetRange(RANGES.YEAR)}
            >
              Last year
            </button>
            <button
              className={cn(s.rangeButton, s.custom, {
                [s.active]: activeRange === RANGES.CUSTOM,
              })}
              type="button"
              onClick={() => setIsCustomRangeOpen(true)}
            >
              Custom range
            </button>
          </div>
        </div>
        {isCustomRangeOpen ? (
          <div className={s.footer}>
            <div className={s.selectedDate}>
              <div className={s.selectedDateTitle}>From</div>
              <div className={s.selectedDateValue}>
                {isValid(calendarDateInterval.start)
                  ? format(calendarDateInterval.start, 'MMM d, yyyy hh:mm aa')
                  : '--'}
              </div>
            </div>
            <div className={s.selectedDate}>
              <div className={s.selectedDateTitle}>To</div>
              <div className={s.selectedDateValue}>
                {isValid(calendarDateInterval.end)
                  ? format(calendarDateInterval.end, 'MMM d, yyyy hh:mm aa')
                  : '--'}
              </div>
            </div>
            <div className={s.buttonsWarp}>
              <button
                type="button"
                className={s.clearButton}
                onClick={handlerClear}
              >
                Clear
              </button>
              <button
                type="button"
                className={s.applyButton}
                onClick={() => handlerSetRange(RANGES.CUSTOM)}
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
