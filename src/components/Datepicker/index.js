import { useState, useRef, useEffect, useMemo } from 'react';
import ReactDatePicker from 'react-datepicker';
import cn from 'classnames';
import outy from 'outy';

import format from 'date-fns/format';
import DICD from 'date-fns/differenceInCalendarDays';
import DICM from 'date-fns/differenceInCalendarMonths';
import sub from 'date-fns/sub';

import { Svg } from 'components/Svg';

import 'react-datepicker/dist/react-datepicker.css';
import s from './s.module.css';

const RANGES = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  HALF_YEAR: 'half_year',
  YEAR: 'year',
  CUSTOM: 'custom',
};

export const Datepicker = ({ className, dateInterval, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [calendarDateInterval, setCalendarDateInterval] = useState(
    dateInterval
  );
  const wrapRef = useRef();

  const activeRange = useMemo(() => {
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
    return RANGES.CUSTOM;
  }, [isOpen]);

  useEffect(() => {
    const outsideTap = outy([wrapRef.current], ['click', 'touchend'], () =>
      setIsOpen(false)
    );

    return () => outsideTap.remove();
  }, []);

  const handlerSetRange = (range) => {
    let newStartDate = calendarDateInterval.start;
    let newEndDate = new Date();

    switch (range) {
      case RANGES.WEEK:
        newStartDate = sub(new Date(), { weeks: 1 });
        break;
      case RANGES.MONTH:
        newStartDate = sub(new Date(), { months: 1 });
        break;
      case RANGES.QUARTER:
        newStartDate = sub(new Date(), { months: 3 });
        break;
      case RANGES.HALF_YEAR:
        newStartDate = sub(new Date(), { months: 6 });
        break;
      case RANGES.YEAR:
        newStartDate = sub(new Date(), { years: 1 });
        break;
      case RANGES.CUSTOM:
        newEndDate = calendarDateInterval.end;
        break;
      default:
        return;
    }

    onChange({ start: newStartDate, end: newEndDate });
    setIsCustomRangeOpen(false);
    setIsOpen(false);
  };

  const handlerClear = () => {
    setCalendarDateInterval(dateInterval);
  };

  return (
    <div className={cn(s.wrap, className)} ref={wrapRef}>
      <Svg id="calendar" className={s.iconCalendar} />
      <button
        onClick={() => setIsOpen((prevState) => !prevState)}
        className={cn(s.button, { [s.active]: isOpen })}
      >
        {format(dateInterval.start, 'LLL d, yyyy')}
        <span className={s.dateSeparator}>-</span>
        {format(dateInterval.end, 'LLL d, yyyy')}
      </button>
      <Svg
        id="dropdown-arrow-down"
        className={cn(s.iconArrow, { [s.rotate]: isOpen })}
      />
      <div className={cn(s.datePickerWrap, { [s.active]: isOpen })}>
        <div className={s.calendarsWrap}>
          {isCustomRangeOpen ? (
            <>
              <ReactDatePicker
                selected={calendarDateInterval.start}
                onChange={(start) =>
                  setCalendarDateInterval((prevInterval) => ({
                    ...prevInterval,
                    start,
                  }))
                }
                selectsStart
                startDate={calendarDateInterval.start}
                endDate={calendarDateInterval.nd}
                maxDate={dateInterval.end}
                inline
                calendarClassName={s.reactDatepicker}
              />
              <ReactDatePicker
                selected={calendarDateInterval.end}
                onChange={(end) =>
                  setCalendarDateInterval((prevInterval) => ({
                    ...prevInterval,
                    end,
                  }))
                }
                selectsEnd
                startDate={calendarDateInterval.start}
                endDate={calendarDateInterval.end}
                minDate={calendarDateInterval.start}
                inline
                calendarClassName={s.reactDatepicker}
                maxDate={new Date()}
                maxTime={new Date()}
              />
            </>
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
                {format(calendarDateInterval.start, 'MMM d, yyyy hh:mm aa')}
              </div>
            </div>
            <div className={s.selectedDate}>
              <div className={s.selectedDateTitle}>To</div>
              <div className={s.selectedDateValue}>
                {format(calendarDateInterval.end, 'MMM d, yyyy hh:mm aa')}
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
