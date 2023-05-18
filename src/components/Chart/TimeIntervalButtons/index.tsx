import cn from 'classnames';
import { CHART_SCALE } from 'constant';
import { ReactElement, useCallback } from 'react';
import { ObjectParam, useQueryParam } from 'use-query-params';
import { getNormalizedScale } from 'utils/string';

import s from './s.module.css';

interface ITimeIntervalButtons {
  chartId: number;
}
export const TimeIntervalButtons = ({ chartId }: ITimeIntervalButtons): ReactElement => {
  const [chartsQuery, setChartsQuery] = useQueryParam('charts', ObjectParam);

  const handlerClick = useCallback(
    (value) => {
      setChartsQuery((prevQuery) => ({
        ...prevQuery,
        [chartId]: value,
      }));
    },
    [chartId, setChartsQuery]
  );

  return (
    <div className={s.wrap}>
      <span className={s.title}>Resolution</span>
      <div className={s.rangeWrap}>
        {CHART_SCALE.map((item) => {
          return (
            <button
              type="button"
              key={item.queryKey}
              onClick={(e) => {
                e.preventDefault();
                handlerClick(item.queryKey);
              }}
              className={cn(s.button, {
                [s.active]: getNormalizedScale(chartsQuery?.[chartId]) === item.queryKey,
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
