import { useState } from 'react';

import { Month } from './Month';
import s from './s.module.css';

export const DateRangePicker = ({ interval, onChange }) => {
  const [hoverDate, setHoverDate] = useState(null);

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
        start
        interval={interval}
        onChange={handlerChangePreviewInterval}
        hoverDate={hoverDate}
        onChangeHoverDate={setHoverDate}
      />
      <Month
        interval={interval}
        onChange={handlerChangePreviewInterval}
        hoverDate={hoverDate}
        onChangeHoverDate={setHoverDate}
      />
    </div>
  );
};
