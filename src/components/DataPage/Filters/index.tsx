import cn from 'classnames';
import { ReactElement } from 'react';

import s from './s.module.css';

type TFilters = {
  items: {
    children: string;
    isActive?: boolean;
    onClick: () => void;
  }[];
  className?: string;
};
export const Filters = ({ items, className }: TFilters): ReactElement => {
  return (
    <nav className={cn(s.wrap, className)}>
      {items.map(({ isActive, ...rest }, idx) => {
        return (
          <button
            key={idx}
            type="button"
            className={cn(s.item, { [s.active]: isActive })}
            {...rest}
          />
        );
      })}
    </nav>
  );
};
