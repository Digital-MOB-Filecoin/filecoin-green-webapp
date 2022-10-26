import cn from 'classnames';

import { Spinner } from 'components/Spinner';
import { Svg } from 'components/Svg';

import s from './s.module.css';

export const ChartTable = ({ loading, columns, onBackToCountries }) => {
  return (
    <div className={s.wrapper}>
      <div className={s.tableWrapper}>
        <table>
          <thead>
            <tr>
              {columns.head.map((item, idx) => (
                <th
                  key={idx}
                  className={cn({ [s.alignRight]: item.alignRight })}
                >
                  <div>{item.title || <>&nbsp;</>}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>
                  <Spinner />
                </td>
              </tr>
            ) : columns.data.length ? (
              columns.data.map((items, idx) => (
                <tr key={idx}>
                  {items.map((item, idx) => (
                    <td
                      key={idx}
                      className={cn({ [s.alignRight]: item.alignRight })}
                    >
                      {item.value}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {onBackToCountries ? (
        <button
          type="button"
          className={s.backButton}
          onClick={onBackToCountries}
        >
          <Svg id="navigation-left" />
          <span>Back to countries</span>
        </button>
      ) : null}
    </div>
  );
};
