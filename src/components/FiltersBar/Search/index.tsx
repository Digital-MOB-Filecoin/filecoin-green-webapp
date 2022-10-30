import { useState } from 'react';
import cn from 'classnames';
import { useQueryParam, StringParam } from 'use-query-params';

// import { filterUniq } from 'utils/array';
import { Svg } from 'components/Svg';

import s from './s.module.css';

type TSearch = {
  isMapShown: boolean;
  onShowMap: () => void;
};
export function Search({ isMapShown, onShowMap }: TSearch) {
  const [queryMiner, setQueryMiner] = useQueryParam('miner', StringParam, {
    skipUpdateWhenNoChange: false,
  });
  const [value, setValue] = useState('');

  const handlerSubmit = (e) => {
    e.preventDefault();

    if (value) {
      setValue('');
      setQueryMiner(value || undefined);
    }
  };

  const handlerRemoveMiner = () => {
    setQueryMiner(undefined);
  };

  return (
    <form
      className={cn(s.form, { [s.hasFocus]: isMapShown })}
      onSubmit={handlerSubmit}
    >
      <Svg id="search" className={s.icon} />
      <div className={s.minersWrapper}>
        {queryMiner ? (
          <span className={s.miner}>
            <span>{queryMiner}</span>
            <button
              type="button"
              onClick={() => handlerRemoveMiner()}
              className={s.minerRemoveButton}
            >
              <Svg id="close" width={16} height={16} />
            </button>
          </span>
        ) : null}
      </div>
      <input
        type="search"
        className={s.input}
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onFocus={() => onShowMap()}
        placeholder="Storage Provider ID"
      />
    </form>
  );
}
