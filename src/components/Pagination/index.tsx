import cn from 'classnames';

import { Svg } from 'components/Svg';

import s from './s.module.css';

function pagination(current, last, delta = 2) {
  if (last >= 1 && last <= 3) {
    return Array.from({ length: last }).map((_, idx) => idx + 1);
  }

  const left = current - delta;
  const right = current + delta + 1;
  const range: number[] = [];
  const rangeWithDots: (number | null)[] = [];
  let l: number;

  range.push(1);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= left && i < right && i < last && i > 1) {
      range.push(i);
    }
  }

  if (range.length > 1) {
    range.push(last);
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(null);
        }
      }
      rangeWithDots.push(i);
      l = i;
    });
  } else {
    rangeWithDots.push(1);
  }

  return rangeWithDots;
}

type TPagination = {
  skip: number;
  take: number;
  total: number;
  onChangePage: (page: number) => void;
  className?: string;
};

export function Pagination({
  skip,
  take,
  total,
  onChangePage,
  className,
}: TPagination) {
  const currentPage = skip / take + 1;
  const pages = Math.ceil(total / take);
  const paginationList = pagination(currentPage, pages);

  return (
    <ol className={cn(s.pagination, className)}>
      <li>
        <button
          onClick={() => onChangePage(currentPage - 1)}
          className={s.arrowLink}
          disabled={currentPage <= 1}
        >
          <Svg id="navigation-left" aria-label="Previous page" />
        </button>
      </li>
      {paginationList.map((item, idx) => {
        if (item === 0) return null;
        return (
          <li key={idx}>
            <button
              onClick={() => item && onChangePage(item)}
              className={cn(s.pageLink, {
                [s.pageLinkActive]: currentPage === item,
              })}
              disabled={!item}
              tabIndex={!item || currentPage === item ? -1 : 0}
            >
              {item || '...'}
            </button>
          </li>
        );
      })}
      <li>
        <button
          onClick={() => onChangePage(currentPage + 1)}
          className={s.arrowLink}
          disabled={currentPage >= pages}
        >
          <Svg id="navigation-right" aria-label="Next page" />
        </button>
      </li>
    </ol>
  );
}
