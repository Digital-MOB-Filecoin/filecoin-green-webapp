import cn from 'classnames';

import { Svg } from 'components/Svg';

import s from './s.module.css';

function pagination(current, last, delta = 2) {
  const left = current - delta;
  const right = current + delta + 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= left && i < right && i < last && i > 1) {
      range.push(i);
    }
  }
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

  return rangeWithDots;
}

export function Pagination({ skip, take, total, pageHandler }) {
  const currentPage = skip / take + 1;
  const pages = Math.ceil(total / take);
  const paginationList = pagination(currentPage, pages);

  return (
    <ol className={s.pagination}>
      <li>
        <button
          onClick={() => pageHandler(currentPage - 1)}
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
              onClick={() => pageHandler(item)}
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
          onClick={() => pageHandler(currentPage + 1)}
          className={s.arrowLink}
          disabled={currentPage >= pages}
        >
          <Svg id="navigation-right" aria-label="Next page" />
        </button>
      </li>
    </ol>
  );
}
