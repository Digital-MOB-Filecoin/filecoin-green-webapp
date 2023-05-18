import cn from 'classnames';
import { ReactElement, useState } from 'react';
import { DelimitedArrayParam, useQueryParam } from 'use-query-params';

// import { filterUniq } from 'utils/array';
import { Svg } from 'components/Svg';

import s from './s.module.css';

const MINERS_DISPLAYED = 3;

export function Search(): ReactElement {
  const [queryMiners, setQueryMiners] = useQueryParam('miners', DelimitedArrayParam);
  const [value, setValue] = useState<string>('');
  const [hasFocus, setHasFocus] = useState<boolean>(false);

  const handlerSubmit = (e) => {
    e.preventDefault();

    if (value) {
      setQueryMiners((prevQuery) => {
        const filteredValue: string[] = value.split(',').map((item) => item.trim());

        if (prevQuery && prevQuery?.length + filteredValue.length >= 100) {
          return prevQuery;
        }

        const filteredData: string[] =
          prevQuery?.reduce((acc: string[], item) => {
            if (
              item &&
              !acc.includes(item?.toLowerCase()) &&
              !filteredValue.includes(item?.toLowerCase())
            ) {
              acc.push(item.toLowerCase());
            }

            return acc;
          }, []) || [];

        filteredData.push(...filteredValue);

        return filteredData;
      });

      setValue('');
    }
  };

  const handlerRemoveMiner = (minerId: string | null) => {
    setQueryMiners((prevQuery) => {
      const filteredQuery = prevQuery
        ?.filter(Boolean)
        .filter(
          (item, idx, self) =>
            self.indexOf(item) === idx && item?.toLowerCase() !== minerId?.toLowerCase()
        );

      return filteredQuery?.length ? filteredQuery : undefined;
    });
  };

  return (
    <form className={cn(s.form, { [s.hasFocus]: hasFocus })} onSubmit={handlerSubmit}>
      <Svg id="search" className={s.icon} />
      {queryMiners?.length ? (
        <div className={s.minersWrapper}>
          {queryMiners.slice(0, MINERS_DISPLAYED).map((minerId) => {
            return (
              <span key={minerId} className={s.miner}>
                <span>{minerId}</span>
                <button
                  type="button"
                  onClick={() => handlerRemoveMiner(minerId)}
                  className={s.minerRemoveButton}
                >
                  <Svg id="close" width={16} height={16} />
                </button>
              </span>
            );
          })}
          {queryMiners.length > MINERS_DISPLAYED ? (
            <span className={s.minersCount}>+{queryMiners.length - MINERS_DISPLAYED} more</span>
          ) : null}
        </div>
      ) : null}

      <input
        type="search"
        className={s.input}
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Storage Provider ID"
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
      />
    </form>
  );
}
