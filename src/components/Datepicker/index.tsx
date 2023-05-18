import cn from 'classnames';
import { Duration, Interval, format, intervalToDuration, isValid, sub } from 'date-fns';
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { MAX_DATEPICKER_DATE } from 'constant';

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

export type DatepickerInterval = {
  start: Date | number;
  end: Date | number | null;
};

type TDatepicker = {
  className?: string;
  dateInterval: Interval;
  onChange: (interval: Interval) => void;
};

export const Datepicker = ({ className, dateInterval, onChange }: TDatepicker): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [calendarDateInterval, setCalendarDateInterval] = useState<Interval>(dateInterval);
  const wrapperRef = useRef(null);
  const [key, setKey] = useState(Math.random());

  const activeRange = useMemo(() => {
    if (isCustomRangeOpen) return RANGES.CUSTOM;

    const isDiffIs = (duration: Duration): boolean => {
      const helperDuration = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
      const inputDuration = { ...helperDuration, ...duration };
      const intervalDuration = {
        ...helperDuration,
        ...intervalToDuration(dateInterval),
      };

      return Object.keys(inputDuration).every(
        (key) => inputDuration[key] === intervalDuration[key],
      );
    };

    if (isDiffIs({ days: 7 })) {
      return RANGES.WEEK;
    }
    if (isDiffIs({ days: 30 })) {
      return RANGES.MONTH;
    }
    if (isDiffIs({ months: 3 })) {
      return RANGES.QUARTER;
    }
    if (isDiffIs({ months: 6 })) {
      return RANGES.HALF_YEAR;
    }
    if (isDiffIs({ years: 1 })) {
      return RANGES.YEAR;
    }

    setIsCustomRangeOpen(true);
    return RANGES.CUSTOM;
  }, [isCustomRangeOpen, dateInterval]);

  useEffect(() => {
    const clickHandler = (e) => {
      // eslint-disable-next-line react/no-find-dom-node
      if (!ReactDOM.findDOMNode(wrapperRef.current)?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const keyboardHandler = (e) => {
      if (e.code === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', clickHandler, { capture: true });
      document.addEventListener('keyup', keyboardHandler, { capture: true });
    }

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keyup', keyboardHandler);
    };
  }, [isOpen]);

  const handlerSetRange = (range) => {
    let newStartDate = calendarDateInterval.start;
    let newEndDate = MAX_DATEPICKER_DATE;

    switch (range) {
      case RANGES.WEEK:
        newStartDate = sub(MAX_DATEPICKER_DATE, { days: 7 });
        break;
      case RANGES.MONTH:
        newStartDate = sub(MAX_DATEPICKER_DATE, { days: 30 });
        break;
      case RANGES.QUARTER:
        newStartDate = sub(MAX_DATEPICKER_DATE, { months: 3 });
        break;
      case RANGES.HALF_YEAR:
        newStartDate = sub(MAX_DATEPICKER_DATE, { months: 6 });
        break;
      case RANGES.YEAR:
        newStartDate = sub(MAX_DATEPICKER_DATE, { years: 1 });
        break;
      case RANGES.CUSTOM:
        newEndDate = calendarDateInterval.end || MAX_DATEPICKER_DATE;
        break;
      default:
        return;
    }

    setCalendarDateInterval({ start: newStartDate, end: newEndDate });
    onChange({ start: newStartDate, end: newEndDate });
    setIsCustomRangeOpen(false);
    setIsOpen(false);
  };

  const handlerClear = useCallback(() => {
    setCalendarDateInterval(dateInterval);
    setKey(Math.random());
  }, [dateInterval]);

  useEffect(() => {
    handlerClear();
  }, [handlerClear, dateInterval.start, dateInterval.end]);

  return (
    <div className={cn(s.wrap, className)} ref={wrapperRef}>
      <Svg id="calendar" className={s.iconCalendar} />
      <button
        onClick={() => setIsOpen((prevState) => !prevState)}
        className={cn(s.button, { [s.active]: isOpen })}
      >
        {isValid(dateInterval.start) ? format(dateInterval.start, 'LLL d, yyyy') : '--'}
        <span className={s.dateSeparator}>-</span>
        {isValid(dateInterval.end) ? format(dateInterval.end, 'LLL d, yyyy') : '--'}
      </button>
      <Svg id="dropdown-arrow-down" className={cn(s.iconArrow, { [s.rotate]: isOpen })} />
      <div className={cn(s.datePickerWrap, { [s.active]: isOpen })}>
        <div className={s.calendarsWrap}>
          {isCustomRangeOpen ? (
            <DateRangePicker
              key={key}
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
                {calendarDateInterval.end && isValid(calendarDateInterval.end)
                  ? format(calendarDateInterval.end, 'MMM d, yyyy hh:mm aa')
                  : '--'}
              </div>
            </div>
            <div className={s.buttonsWarp}>
              <button type="button" className={s.clearButton} onClick={handlerClear}>
                Clear
              </button>
              <button
                type="button"
                className={s.applyButton}
                onClick={() => handlerSetRange(RANGES.CUSTOM)}
                disabled={!calendarDateInterval.start || !calendarDateInterval.end}
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
