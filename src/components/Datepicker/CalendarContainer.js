import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import { useDebouncedCallback } from 'use-debounce';

import set from 'date-fns/set';
import add from 'date-fns/add';
import sub from 'date-fns/sub';
import lightFormat from 'date-fns/lightFormat';

import cn from 'classnames';

// eslint-disable-next-line css-modules/no-unused-class
import s from './s.module.css';

export const CalendarContainer = ({ className, children, date, setDate }) => {
  const inputGroupId = useMemo(nanoid, []);
  const input1Id = useMemo(nanoid, []);
  const input2Id = useMemo(nanoid, []);

  const debouncedCallback = useDebouncedCallback(setDate, 1000);

  const onHoursChange = (event) => {
    const { value } = event.target;
    if (
      !event.target.validity.valid ||
      Number(value) < 1 ||
      Number(value) > 12
    ) {
      debouncedCallback.cancel();
      return;
    }

    debouncedCallback(set(date, { hours: Number(value) }));
  };

  const onMinutesChange = (event) => {
    const { value } = event.target;
    if (
      !event.target.validity.valid ||
      Number(value) < 0 ||
      Number(value) > 59
    ) {
      debouncedCallback.cancel();
      return;
    }

    debouncedCallback(set(date, { minutes: Number(value) }));
  };

  const onTimeFormatChange = (event) => {
    if (event.target.value === lightFormat(date, 'aaaaa')) return;

    setDate((prevState) =>
      event.target.value === 'a'
        ? sub(prevState, { hours: 12 })
        : add(prevState, { hours: 12 })
    );
  };

  return (
    <div className={className}>
      {children}
      <div className={s.timeControlsWrap}>
        <div className={s.timeWrap}>
          <input
            type="number"
            className={s.timeInput}
            placeholder="HH"
            min={1}
            max={12}
            defaultValue={lightFormat(date, 'h')}
            onChange={onHoursChange}
          />
          <div className={s.timeSeparator} />
          <input
            type="number"
            className={s.timeInput}
            placeholder="MM"
            min={0}
            max={59}
            defaultValue={lightFormat(date, 'm')}
            onChange={onMinutesChange}
          />
        </div>
        <div className={s.ampmWrap}>
          <label
            htmlFor={input1Id}
            className={cn(s.amLabel, { [s.active]: false })}
          >
            <input
              type="radio"
              name={inputGroupId}
              value="a"
              id={input1Id}
              checked={lightFormat(date, 'aaaaa') === 'a'}
              onChange={onTimeFormatChange}
            />
            <div>AM</div>
          </label>
          <label
            htmlFor={input2Id}
            className={cn(s.pmLabel, { [s.active]: false })}
          >
            <input
              type="radio"
              name={inputGroupId}
              value="p"
              id={input2Id}
              checked={lightFormat(date, 'aaaaa') === 'p'}
              onChange={onTimeFormatChange}
            />
            <div>PM</div>
          </label>
        </div>
      </div>
    </div>
  );
};
