import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import cn from 'classnames';

import format from 'date-fns/format';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import sub from 'date-fns/sub';

import { Svg } from 'components/Svg';
import { CalendarContainer } from './CalendarContainer';
import { useGeneral } from 'context/general';

import 'react-datepicker/dist/react-datepicker.css';
// eslint-disable-next-line css-modules/no-unused-class
import s from './s.module.css';

export const Datepicker = ({ className }) => {
  const { generalSelectors, generalActions } = useGeneral();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(
    generalSelectors.startDate
  );
  const [calendarEndDate, setCalendarEndDate] = useState(
    generalSelectors.endDate
  );

  const checkActiveRange = (range) => {
    if (isCustomRangeOpen && range !== 'custom') {
      return false;
    }

    switch (range) {
      case 'custom':
        return isCustomRangeOpen;
      case '7d':
        return (
          differenceInCalendarDays(
            generalSelectors.endDate,
            generalSelectors.startDate
          ) === 7
        );
      case '30d':
        return (
          differenceInCalendarDays(
            generalSelectors.endDate,
            generalSelectors.startDate
          ) === 30
        );
      case '3m':
        return (
          differenceInCalendarMonths(
            generalSelectors.endDate,
            generalSelectors.startDate
          ) === 3
        );
      case '6m':
        return (
          differenceInCalendarMonths(
            generalSelectors.endDate,
            generalSelectors.startDate
          ) === 6
        );
      case '1y':
        return (
          differenceInCalendarMonths(
            generalSelectors.endDate,
            generalSelectors.startDate
          ) === 12
        );
      default:
        return false;
    }
  };

  const handlerSetRange = (range) => {
    const dateNow = new Date();

    switch (range) {
      case 'custom':
        setIsCustomRangeOpen(true);
        break;
      case '7d':
        setIsCustomRangeOpen(false);
        generalActions.setStartDate(sub(dateNow, { days: 7 }));
        generalActions.setEndDate(dateNow);
        break;
      case '30d':
        setIsCustomRangeOpen(false);
        generalActions.setStartDate(sub(dateNow, { days: 30 }));
        generalActions.setEndDate(dateNow);
        break;
      case '3m':
        setIsCustomRangeOpen(false);
        generalActions.setStartDate(sub(dateNow, { months: 3 }));
        generalActions.setEndDate(dateNow);
        break;
      case '6m':
        setIsCustomRangeOpen(false);
        generalActions.setStartDate(sub(dateNow, { months: 6 }));
        generalActions.setEndDate(dateNow);
        break;
      case '1y':
        setIsCustomRangeOpen(false);
        generalActions.setStartDate(sub(dateNow, { years: 1 }));
        generalActions.setEndDate(dateNow);
        break;
      default:
        return;
    }
  };

  const handlerClear = () => {
    setCalendarStartDate(generalSelectors.startDate);
    setCalendarEndDate(generalSelectors.endDate);
  };

  const handlerApply = () => {
    generalActions.setStartDate(calendarStartDate);
    generalActions.setEndDate(calendarEndDate);
  };

  return (
    <div className={cn(s.wrap, className)}>
      <Svg id="calendar" className={s.iconCalendar} />
      <button
        onClick={() => setIsOpen((prevState) => !prevState)}
        className={cn(s.button, { [s.active]: isOpen })}
      >
        {format(generalSelectors.startDate, 'LLL d, yyyy')}
        <span className={s.dateSeparator}>-</span>
        {format(generalSelectors.endDate, 'LLL d, yyyy')}
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
                selected={calendarStartDate}
                onChange={(date) => setCalendarStartDate(date)}
                selectsStart
                startDate={calendarStartDate}
                endDate={calendarEndDate}
                inline
                calendarClassName={s.reactDatepicker}
                calendarContainer={(props) => (
                  <CalendarContainer
                    date={calendarStartDate}
                    setDate={setCalendarStartDate}
                    {...props}
                  />
                )}
              />
              <ReactDatePicker
                selected={calendarEndDate}
                onChange={(date) => setCalendarEndDate(date)}
                selectsEnd
                startDate={calendarStartDate}
                endDate={calendarEndDate}
                minDate={calendarStartDate}
                inline
                calendarClassName={s.reactDatepicker}
                calendarContainer={(props) => (
                  <CalendarContainer
                    date={calendarEndDate}
                    setDate={setCalendarEndDate}
                    {...props}
                  />
                )}
                maxDate={new Date()}
                maxTime={new Date()}
              />
            </>
          ) : null}
          <div className={s.rangeWrap}>
            <button
              className={cn(s.rangeButton, {
                [s.active]: checkActiveRange('7d'),
              })}
              type="button"
              onClick={() => handlerSetRange('7d')}
            >
              7 days
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: checkActiveRange('30d'),
              })}
              type="button"
              onClick={() => handlerSetRange('30d')}
            >
              30 days
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: checkActiveRange('3m'),
              })}
              type="button"
              onClick={() => handlerSetRange('3m')}
            >
              3 months
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: checkActiveRange('6m'),
              })}
              type="button"
              onClick={() => handlerSetRange('6m')}
            >
              6 months
            </button>
            <button
              className={cn(s.rangeButton, {
                [s.active]: checkActiveRange('1y'),
              })}
              type="button"
              onClick={() => handlerSetRange('1y')}
            >
              Last year
            </button>
            <button
              className={cn(s.rangeButton, s.custom, {
                [s.active]: checkActiveRange('custom'),
              })}
              type="button"
              onClick={() => handlerSetRange('custom')}
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
                {format(calendarStartDate, 'MMM d, yyyy hh:mm aa')}
              </div>
            </div>
            <div className={s.selectedDate}>
              <div className={s.selectedDateTitle}>To</div>
              <div className={s.selectedDateValue}>
                {format(calendarEndDate, 'MMM d, yyyy hh:mm aa')}
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
                onClick={handlerApply}
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
