import { useState } from 'react';

import { Month } from './Month';
import s from './s.module.css';

export const DateRangePicker = ({ interval, onChange }) => {
  const [hoverDate, setHoverDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState({
    start: interval.start,
    end: interval.end,
  });

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
