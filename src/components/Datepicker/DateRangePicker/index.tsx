import { Interval } from 'date-fns';
import { ReactElement, useState } from 'react';

import { Month } from './Month';
import s from './s.module.css';

type TDateRangePicker = {
  interval: Interval;
  onChange: (interval: Interval) => void;
};
export const DateRangePicker = ({ interval, onChange }: TDateRangePicker): ReactElement => {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Interval>(interval);

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
