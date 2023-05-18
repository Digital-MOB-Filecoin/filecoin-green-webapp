import cn from 'classnames';
import { ReactElement } from 'react';

import { Spinner } from 'components/Spinner';
import { Svg } from 'components/Svg';

import s from './s.module.css';

export type TMapChartTableRow = {
  onClick?: () => void;
  data: {
    value: string;
    alignRight?: boolean;
  }[];
};

type TMapChartTable = {
  loading: boolean;
  head: { title: string; alignRight?: boolean }[];
  data: TMapChartTableRow[];
  onBackToCountries?: () => void;
};

export const MapChartTable = ({
  loading,
  head,
  data,
  onBackToCountries,
}: TMapChartTable): ReactElement => {
  return (
    <div className={s.wrapper}>
      <div className={s.tableWrapper}>
        <div className={s.tableHead}>
          <div className={s.tableRow}>
            {head.map((item, idx) => (
              <div key={idx} className={cn(s.tableTh, { [s.alignRight]: item.alignRight })}>
                <div>{item.title || <>&nbsp;</>}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.tableBody}>
          {loading ? (
            <div className={s.tableRow}>
              <div className={cn(s.tableTd, s.alignCenter)}>
                <Spinner />
              </div>
            </div>
          ) : data.length ? (
            data.map((row, idx) => {
              const children = row.data.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(s.tableTd, {
                    [s.alignRight]: item.alignRight,
                  })}
                >
                  {item.value}
                </div>
              ));

              return row.onClick ? (
                <button key={idx} type="button" className={s.tableRow} onClick={row.onClick}>
                  {children}
                </button>
              ) : (
                <div key={idx} className={s.tableRow}>
                  {children}
                </div>
              );
            })
          ) : (
            <div className={s.tableRow}>
              <div className={cn(s.tableTd, s.alignCenter)}>No data</div>
            </div>
          )}
        </div>
      </div>

      {onBackToCountries ? (
        <button type="button" className={s.backButton} onClick={onBackToCountries}>
          <Svg id="navigation-left" />
          <span>Back to countries</span>
        </button>
      ) : null}
    </div>
  );
};
