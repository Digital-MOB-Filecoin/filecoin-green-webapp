import cn from 'classnames';
import { ReactElement, ReactNode } from 'react';
import { useQueryParams } from 'use-query-params';

import { Svg } from 'components/Svg';

import s from './s.module.css';

interface ISortButton {
  children: ReactNode;
  sortKey: string;
}

export const SortButton = ({ children, sortKey }: ISortButton): ReactElement => {
  const [query, setQuery] = useQueryParams();

  const handlerSort = (direction) => {
    const clearSort = sortKey === query.sortBy && direction === query.order;

    setQuery((prevQuery) => ({
      ...prevQuery,
      sortBy: clearSort ? undefined : sortKey,
      order: clearSort ? undefined : direction,
      offset: undefined,
    }));
  };

  const isActive = (direction) => {
    return sortKey === query.sortBy && direction === query.order;
  };

  return (
    <div className={s.wrap}>
      <span>{children}</span>
      <div className={s.buttonsWrap}>
        <button
          className={cn(s.button, {
            [s.active]: isActive('asc'),
          })}
          type="button"
          onClick={() => handlerSort('asc')}
          tabIndex={0}
        >
          <Svg id="sort-asc" width={6} height={4} className={s.icon} />
        </button>
        <button
          className={cn(s.button, {
            [s.active]: isActive('desc'),
          })}
          type="button"
          onClick={() => handlerSort('desc')}
          tabIndex={0}
        >
          <Svg id="sort-desc" width={6} height={4} className={s.icon} />
        </button>
      </div>
    </div>
  );
};
