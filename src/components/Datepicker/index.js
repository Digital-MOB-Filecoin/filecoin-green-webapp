import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import cn from 'classnames';

import format from 'date-fns/format';
import sub from 'date-fns/add';

import { Svg } from 'components/Svg';

import 'react-datepicker/dist/react-datepicker.css';
import s from './s.module.css';

export const Datepicker = ({ className }) => {
  const [startDate, setStartDate] = useState(
    sub(new Date(), { months: 1, days: 2 })
  );
  const [endDate, setEndDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const handlerChange = () => {};

  const MyContainer = ({ className, children }) => {
    return (
      <div className={className}>
        {children}
        <div>buttons</div>
      </div>
    );
  };

  return (
    <>
      <div className={cn(s.wrap, className)}>
        <Svg id="calendar" className={s.iconCalendar} />
        <button
          onClick={() => setIsOpen((prevState) => !prevState)}
          className={cn(s.button, { [s.active]: isOpen })}
        >
          {format(startDate, 'LLL d, yyyy')}
          <span className={s.dateSeparator}>-</span>
          {format(endDate, 'LLL d, yyyy')}
        </button>
        <Svg
          id="dropdown-arrow-down"
          className={cn(s.iconArrow, { [s.rotate]: isOpen })}
        />
        <div className={cn(s.datePickerWrap, { [s.active]: isOpen })}>
          <ReactDatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            inline
            calendarClassName={s.reactDatepicker}
            calendarContainer={MyContainer}
          />
          <ReactDatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            inline
            calendarClassName={s.reactDatepicker}
            calendarContainer={MyContainer}
            maxDate={new Date()}
            maxTime={new Date()}
          />
        </div>
      </div>
    </>
  );
};
