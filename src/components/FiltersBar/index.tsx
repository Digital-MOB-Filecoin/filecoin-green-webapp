import cn from 'classnames';
import { ReactElement } from 'react';

import { Datepicker } from 'components/Datepicker';

import s from './s.module.css';

type TFiltersBar = {
  className?: string;
};

export const FiltersBar = ({ className }: TFiltersBar): ReactElement => {
  return (
    <div style={{ width: '100%', textAlign: 'right' }}>
      <div className={cn(s.wrapper, className)}>
        <Datepicker />
      </div>
    </div>
  );
};
