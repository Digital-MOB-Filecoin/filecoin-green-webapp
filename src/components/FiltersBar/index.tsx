import cn from 'classnames';
import { Interval } from 'date-fns';

import { Datepicker } from 'components/Datepicker';

import { Search } from './Search';
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
}: TFiltersBar) => {
  return (
    <div className={cn(s.wrapper, className)}>
      <Search />
      <Datepicker dateInterval={dateInterval} onChange={onChangeDateInterval} />
    </div>
  );
};
