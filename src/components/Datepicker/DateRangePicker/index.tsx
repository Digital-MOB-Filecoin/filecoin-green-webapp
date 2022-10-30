import { useState } from 'react';

import { Month } from './Month';
import s from './s.module.css';
import { DatepickerInterval } from '../index';

type TDateRangePicker = {
  interval: DatepickerInterval;
  onChange: (interval: DatepickerInterval) => void;
};
export const DateRangePicker = ({ interval, onChange }: TDateRangePicker) => {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] =
    // @ts-ignore
    useState<Interval>(interval);

  const handlerChangePreviewInterval = (newPreviewInterval) => {
    if (newPreviewInterval.start && newPreviewInterval.end) {
      const newInterval =
        newPreviewInterval.start > newPreviewInterval.end
          ? { start: newPreviewInterval.end, end: newPreviewInterval.start }
          : newPreviewInterval;

      onChange(newInterval);
    } else {
      onChange(newPreviewInterval);
    }
  };

  return (
    <div className={s.wrap}>
      <Month
        isStartCalendar
        interval={interval}
        onChange={handlerChangePreviewInterval}
        hoverDate={hoverDate}
        onChangeHoverDate={setHoverDate}
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
      />
      <Month
        isEndCalendar
        interval={interval}
        onChange={handlerChangePreviewInterval}
        hoverDate={hoverDate}
        onChangeHoverDate={setHoverDate}
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
      />
    </div>
  );
};
