import cn from 'classnames';
import { DEFAULT_CHART_SCALE } from 'constant';

import s from './s.module.css';
import { ObjectParam, useQueryParam } from 'use-query-params';

const RANGE = {
  DAY: {
    title: 'Day',
    queryValue: 'day',
    default: DEFAULT_CHART_SCALE === 'day',
  },
  WEEK: {
    title: 'Week',
    queryValue: 'week',
    default: DEFAULT_CHART_SCALE === 'week',
  },
  MONTH: {
    title: 'Month',
    queryValue: 'month',
    default: DEFAULT_CHART_SCALE === 'month',
  },
};

export const TimeIntervalButtons = ({ chartId }) => {
  const [chartsQuery, setChartsQuery] = useQueryParam('charts', ObjectParam);

  const handlerClick = (event, value) => {
    event.preventDefault();
    setChartsQuery((prevQuery) => ({
      ...prevQuery,
      [chartId]: value,
    }));
  };

  return (
    <div className={s.wrap}>
      <span className={s.title}>Resolution</span>
      <div className={s.rangeWrap}>
        {Object.values(RANGE).map((item) => {
          return (
            <button
              type="button"
              key={item.queryValue}
              onClick={(event) => handlerClick(event, item.queryValue)}
              className={cn(s.button, {
                [s.active]:
                  chartsQuery?.[chartId] === item.queryValue ||
                  (!chartsQuery?.[chartId] &&
                    DEFAULT_CHART_SCALE === item.queryValue),
              })}
            >
              {item.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};
