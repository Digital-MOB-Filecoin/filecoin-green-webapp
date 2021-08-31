import cn from 'classnames';

import { defaultDataState } from 'constant';

import { Spinner } from 'components/Spinner';
import { Pagination } from 'components/Pagination';
import { SortButton } from './SortButton';
// eslint-disable-next-line css-modules/no-unused-class
import s from './s.module.css';

export const Table = ({
  title,
  data = defaultDataState,
  columns = [],
  limit,
  offset,
  total,
  pageHandler,
  className,
}) => {
  return (
    <div className={cn(s.wrap, className)}>
      <div className={s.header}>
        <h2 className="h2">{title}</h2>
      </div>
      <table className={s.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.align ? s[column.align] : null}
                style={column.width ? { width: column.width } : null}
              >
                {column.sortKey ? (
                  <SortButton sortKey={column.sortKey}>
                    {column.title}
                  </SortButton>
                ) : (
                  column.title
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.loading ? (
            <tr>
              <td colSpan={4}>
                <div style={{ display: 'flex' }}>
                  <Spinner style={{ margin: 'auto' }} />
                </div>
              </td>
            </tr>
          ) : data.failed ? (
            <tr>
              <td colSpan={4}>Failed to Load Data.</td>
            </tr>
          ) : (
            data.results.map((item) => {
              return (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align ? s[column.align] : null}
                      style={column.width ? { width: column.width } : null}
                    >
                      {column.format
                        ? column.format(item[column.key], item)
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <Pagination
        skip={offset}
        take={limit}
        total={total}
        pageHandler={pageHandler}
        className={s.pagination}
      />
    </div>
  );
};
