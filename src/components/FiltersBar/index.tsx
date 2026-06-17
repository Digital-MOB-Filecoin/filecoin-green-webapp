import cn from 'classnames';
import { Interval } from 'date-fns';
import { ReactElement } from 'react';

import { Datepicker } from 'components/Datepicker';

import s from './s.module.css';

type TFiltersBar = {
  className?: string;
  dateInterval: Interval;
  onChangeDateInterval: (interval: Interval) => void;
};

export const FiltersBar = ({
  className,
  dateInterval,
  onChangeDateInterval,
}: TFiltersBar): ReactElement => {
  return (
    <div style={{ width: '100%', textAlign: 'right' }}>
      <div className={cn(s.wrapper, className)}>
        <Datepicker dateInterval={dateInterval} onChange={onChangeDateInterval} />
      </div>
    </div>
  );
};
