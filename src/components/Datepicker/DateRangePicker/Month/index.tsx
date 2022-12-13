import { Dispatch, SetStateAction, useMemo } from 'react';
import cn from 'classnames';

import {
  getWeeksInMonth,
  getDate,
  addDays,
  differenceInCalendarMonths,
  startOfWeek,
  add,
  sub,
  set,
  format,
  isWithinInterval,
  isValid as isValidDate,
} from 'date-fns';

import { Svg } from 'components/Svg';
import s from './s.module.css';
import { MAX_DATEPICKER_DATE } from 'constant';
import { DatepickerInterval } from '../../index';

enum EnumMONTH {
  CURRENT = 'current',
  PREV = 'prev',
  NEXT = 'next',
}

const getDayMonthType = (dayDate, date): EnumMONTH => {
  const diff = differenceInCalendarMonths(date, dayDate);

  if (diff < 0) return EnumMONTH.NEXT;
  if (diff > 0) return EnumMONTH.PREV;

  return EnumMONTH.CURRENT;
};

type TMonth = {
  isStartCalendar?: boolean;
  isEndCalendar?: boolean;
  interval: DatepickerInterval;
  onChange: (interval: DatepickerInterval) => void;
  hoverDate: Date | null;
  onChangeHoverDate: (date: Date | null) => void;
  calendarMonth: Interval;
  setCalendarMonth: Dispatch<SetStateAction<Interval>>;
};
export const Month = ({
  isStartCalendar,
  isEndCalendar,
  interval,
  onChange,
  hoverDate,
  onChangeHoverDate,
  calendarMonth,
  setCalendarMonth,
}: TMonth) => {
  const shownMonth = isStartCalendar ? calendarMonth.start : calendarMonth.end;

  const calendarMonthDays = useMemo(() => {
    const calendarDaysInMonth =
      getWeeksInMonth(shownMonth || calendarMonth.start) * 7;
    const firstDayInCalendarWeek = startOfWeek(
      set(shownMonth || calendarMonth.start, { date: 1 })
    );

    return Array.from({ length: calendarDaysInMonth }).map((_, idx) => {
      const dayDate = addDays(firstDayInCalendarWeek, idx);
      return {
        date: dayDate,
        dayNumber: getDate(addDays(firstDayInCalendarWeek, idx)),
        monthType: getDayMonthType(dayDate, shownMonth),
      };
    });
  }, [calendarMonth.start, shownMonth]);

  const handlerPrevMonth = () => {
    setCalendarMonth((prevState) => {
      if (isStartCalendar) {
        return {
          end: prevState.end,
          start: sub(prevState.start, { months: 1 }),
        };
      }

      return {
        ...prevState,
        end: sub(prevState.end, { months: 1 }),
      };
    });
  };

  const handlerNextMonth = () => {
    setCalendarMonth((prevState) => {
      if (isStartCalendar) {
        return {
          ...prevState,
          start: add(prevState.start, { months: 1 }),
        };
      }

      return {
        ...prevState,
        end: add(prevState.end, { months: 1 }),
      };
    });
  };

  const isDayInRange = (dayDate) => {
    if (
      !isValidDate(interval.start) ||
      !isValidDate(interval.end) ||
      !isValidDate(dayDate)
    ) {
      return false;
    }

    return isWithinInterval(
      set(dayDate, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      }),
      // @ts-ignore
      interval
    );
  };

  const isDayInPreviewRange = (dayDate) => {
    const endDate = interval.end || hoverDate;

    if (
      !isValidDate(interval.start) ||
      isValidDate(interval.end) ||
      !isValidDate(endDate) ||
      !isValidDate(dayDate) ||
      !isValidDate(hoverDate)
    ) {
      return false;
    }

    return isWithinInterval(
      set(dayDate, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      }),
      // @ts-ignore
      interval.start.getDate() > endDate.getTime()
        ? { start: endDate, end: interval.start }
        : { start: interval.start, end: endDate }
    );
  };

  const isSameDay = (dateLeft, dateRight) => {
    if (!isValidDate(dateLeft) || !isValidDate(dateRight)) {
      return false;
    }

    const normalizeDate = (date) => {
      return set(date, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }).getTime();
    };

    return normalizeDate(dateLeft) === normalizeDate(dateRight);
  };

  const isSameMonth = (dateLeft, dateRight) => {
    if (!isValidDate(dateLeft) || !isValidDate(dateRight)) {
      return false;
    }

    const normalizeDate = (date) => {
      return set(date, {
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }).getTime();
    };

    return normalizeDate(dateLeft) === normalizeDate(dateRight);
  };

  const handlerChangePreviewInterval = (dayDate: Date) => {
    const isIntervalDatesValid =
      isValidDate(interval.start) && isValidDate(interval.end);

    if (isEndCalendar && isIntervalDatesValid) {
      setCalendarMonth({
        start: dayDate,
        end: dayDate,
      });
    }

    onChange(
      isIntervalDatesValid
        ? { start: dayDate, end: null }
        : { start: interval.start, end: dayDate }
    );
  };

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <button
          type="button"
          onClick={handlerPrevMonth}
          className={cn(s.navButton, {
            [s.disabled]:
              isEndCalendar &&
              isSameMonth(calendarMonth.start, calendarMonth.end),
          })}
        >
          <Svg id="calendar-arrow-left" />
        </button>
        <span>{shownMonth ? format(shownMonth, 'MMMM yyyy') : '---'}</span>
        <button
          type="button"
          onClick={handlerNextMonth}
          className={cn(s.navButton, {
            [s.disabled]:
              isSameMonth(shownMonth, new Date()) ||
              (isStartCalendar &&
                isSameMonth(calendarMonth.start, calendarMonth.end)),
          })}
          disabled={isSameMonth(shownMonth, new Date())}
        >
          <Svg id="calendar-arrow-right" />
        </button>
      </div>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((weekDay, idx) => (
        <span key={idx} className={s.weekday}>
          {weekDay}
        </span>
      ))}
      <div onMouseLeave={() => onChangeHoverDate(null)}>
        {calendarMonthDays.map((day) => {
          if (!day) return null;
          const { date: dayDate, dayNumber, monthType } = day;
          const maxDateTime =
            typeof MAX_DATEPICKER_DATE === 'number'
              ? MAX_DATEPICKER_DATE
              : MAX_DATEPICKER_DATE.getTime();
          const intervalStartTime =
            typeof interval.start === 'number'
              ? interval.start
              : interval.start.getTime();
          const isDisabled =
            dayDate.getTime() > maxDateTime ||
            (isStartCalendar && !interval.end) ||
            (dayDate.getTime() < intervalStartTime && !interval.end);

          return (
            <button
              key={dayDate.getTime()}
              type="button"
              className={cn(s.day, {
                [s.prev]: monthType === EnumMONTH.PREV,
                [s.next]: monthType === EnumMONTH.NEXT,
                [s.inRange]:
                  isValidDate(interval.start) &&
                  isValidDate(interval.end) &&
                  isDayInRange(dayDate),
                [s.rangeStart]:
                  isValidDate(interval.start) &&
                  isSameDay(dayDate, interval.start),
                [s.rangeEnd]:
                  isValidDate(interval.end) && isSameDay(dayDate, interval.end),
                [s.disabled]: isDisabled,
                [s.today]: isSameDay(dayDate, new Date()),
                [s.hover]:
                  isValidDate(hoverDate) && isSameDay(dayDate, hoverDate),
                [s.inPreviewRange]: isDayInPreviewRange(dayDate),
                [s.previewRangeStart]:
                  !isValidDate(interval.end) &&
                  isSameDay(interval.start, dayDate),
                [s.previewRangeEnd]:
                  !isValidDate(interval.end) &&
                  isValidDate(hoverDate) &&
                  isSameDay(hoverDate, dayDate),
              })}
              onClick={() => {
                if (!isDisabled) {
                  handlerChangePreviewInterval(dayDate);
                }
              }}
              onMouseOver={() => {
                onChangeHoverDate(dayDate);
              }}
              onFocus={() => {
                onChangeHoverDate(dayDate);
              }}
              tabIndex={isDisabled ? -1 : 0}
            >
              <span className={s.dayNumber}>
                <span>{dayNumber}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
