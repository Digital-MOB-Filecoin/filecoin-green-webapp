import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

import { DEFAULT_INTERVAL, INTERVALS, STATIC_END_DATE, TIntervalKey } from 'constant';

import { Svg } from 'components/Svg';

import s from './s.module.css';

type TDatepicker = {
  className?: string;
};

export const Datepicker = ({ className }: TDatepicker): ReactElement => {
  const [intervalKey, setIntervalKey] = useQueryParam(
    'interval',
    withDefault(StringParam, DEFAULT_INTERVAL),
  );
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = INTERVALS.find((i) => i.key === intervalKey) ?? INTERVALS[2];

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const keyboardHandler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', clickHandler, { capture: true });
      document.addEventListener('keyup', keyboardHandler, { capture: true });
    }

    return () => {
      document.removeEventListener('click', clickHandler, { capture: true });
      document.removeEventListener('keyup', keyboardHandler, { capture: true });
    };
  }, [isOpen]);

  return (
    <div className={cn(s.wrap, className)} ref={wrapperRef}>
      <Svg id="calendar" className={s.iconCalendar} />
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(s.button, { [s.active]: isOpen })}
      >
        {format(parseISO(selected.start), 'LLL d, yyyy')}
        <span className={s.dateSeparator}>-</span>
        {format(STATIC_END_DATE, 'LLL d, yyyy')}
      </button>
      <Svg id="dropdown-arrow-down" className={cn(s.iconArrow, { [s.rotate]: isOpen })} />
      <div className={cn(s.datePickerWrap, { [s.active]: isOpen })}>
        <div className={s.rangeWrap}>
          {INTERVALS.map((item) => (
            <button
              key={item.key}
              className={cn(s.rangeButton, { [s.active]: selected.key === item.key })}
              type="button"
              onClick={() => {
                setIntervalKey(item.key as TIntervalKey);
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
