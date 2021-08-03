import { NavLink } from 'react-router-dom';

import s from './s.module.css';

const RANGE = {
  DAY: { title: 'Day', queryValue: 'day', default: true },
  WEEK: { title: 'Week', queryValue: 'week' },
  MONTH: { title: 'Month', queryValue: 'month' },
};

export const TimeIntervalButtons = ({ queryKey }) => {
  const generateLinkUrl = (queryValue) => {
    return (location) => {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set(queryKey, queryValue);

      return `${location.pathname}?${queryParams.toString()}`;
    };
  };

  return (
    <div className={s.wrap}>
      <span className={s.title}>Resolution</span>
      <div className={s.rangeWrap}>
        {Object.values(RANGE).map((item) => (
          <NavLink
            key={item.queryValue}
            to={() => generateLinkUrl(item.queryValue)}
            className={s.button}
            activeClassName={s.active}
            isActive={(match, location) => {
              const queryParams = new URLSearchParams(location.search);
              return queryParams.has(queryKey)
                ? queryParams.get(queryKey) === item.queryValue
                : item.default;
            }}
          >
            {item.title}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
