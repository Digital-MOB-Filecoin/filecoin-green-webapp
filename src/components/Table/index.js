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
  limit,
  offset,
  total,
  pageHandler,
  className,
  ThRow,
  TdRow,
}) => {
  return (
    <div className={cn(s.wrap, className)}>
      <div className={s.header}>
        <h2 className="h2">{title}</h2>
      </div>
      <table className={s.table}>
        <thead>{ThRow}</thead>
        <tbody>
          {data.failed ? (
            <tr>
              <td colSpan={4}>Failed to Load Data.</td>
            </tr>
          ) : (
            data.results.map((rowData, idx) => (
              <TdRow key={idx} data={rowData} idx={idx} />
            ))
          )}
        </tbody>
      </table>
      {data.loading ? (
        <div className={s.spinnerWrapper}>
          <Spinner style={{ margin: 'auto' }} />
        </div>
      ) : null}
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
