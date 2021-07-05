import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

export const Datepicker = () => {
  const [selected, setSelected] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handlerChange = () => {};

  return (
    <ReactDatePicker
      inline
      selected={selected}
      startDate={startDate}
      endDate={endDate}
      onChange={handlerChange}
      monthsShown={2}
      shouldCloseOnSelect={false}
    />
  );
};
