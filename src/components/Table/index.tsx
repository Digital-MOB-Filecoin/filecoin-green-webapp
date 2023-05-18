import cn from 'classnames';
import { ReactElement } from 'react';

import { TFetchMinersResponseMiners } from 'api';

import { Pagination } from 'components/Pagination';
import { Spinner } from 'components/Spinner';

import { SortButton } from './SortButton';
import s from './s.module.css';

type TTable = {
  title: string;
  data: TFetchMinersResponseMiners[];
  loading: boolean;
  failed: boolean;
  columns: {
    title: string;
    key: string;
    sortKey?: string;
    align?: string;
    width?: string;
    format?: (item: 'miner' | 'power' | 'used', column: TFetchMinersResponseMiners) => void;
  }[];
  limit: number;
  offset: number;
  total: number;
  onChangePage: (page: number) => void;
  className?: string;
};
export const Table = ({
  title,
  data = [],
  loading,
  failed,
  columns = [],
  limit,
  offset,
  total,
  onChangePage,
  className,
}: TTable): ReactElement => {
  return (
    <div className={cn(s.wrap, className)}>
      <div className={s.header}>
        <h2 className="h2">{title}</h2>
      </div>
      <table className={s.table}>
        <thead>
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={column.align ? s[column.align] : ''}
                style={column.width ? { width: column.width } : {}}
              >
                {column.sortKey ? (
                  <SortButton sortKey={column.sortKey}>{column.title}</SortButton>
                ) : (
                  column.title
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {failed ? (
            <tr>
              <td colSpan={4}>Failed to Load Data.</td>
            </tr>
          ) : data.length ? (
            data.map((item, idx) => {
              return (
                <tr key={idx}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align ? s[column.align] : ''}
                      style={column.width ? { width: column.width } : {}}
                    >
                      {column.format ? column.format(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4}>No data.</td>
            </tr>
          )}
        </tbody>
      </table>
      {loading ? (
        <div className={s.spinnerWrapper}>
          <Spinner style={{ margin: 'auto' }} />
        </div>
      ) : null}
      <Pagination
        skip={offset}
        take={limit}
        total={total}
        onChangePage={onChangePage}
        className={s.pagination}
      />
    </div>
  );
};
