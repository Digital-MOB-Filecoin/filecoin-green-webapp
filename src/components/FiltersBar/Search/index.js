import { useEffect, useState } from 'react';
import cn from 'classnames';
import { useDebouncedCallback } from 'use-debounce';
import { useQueryParam, StringParam } from 'use-query-params';

import { Svg } from 'components/Svg';
import s from './s.module.css';

const inputName = 'search';

export function Search({ isMapShown, onShowMap }) {
  const [minerQuery, setMinerQuery] = useQueryParam('miner', StringParam);
  const [value, setValue] = useState(minerQuery);

  useEffect(() => {
    setValue(minerQuery);
  }, [minerQuery]);

  const handlerSubmit = (event) => {
    debounced.cancel();
    const formData = new FormData(event.target);
    event.preventDefault();

    handlerSetQuery(formData.get(inputName));
  };

  const handlerSetQuery = (value) => {
    setMinerQuery(value || undefined);
  };

  const debounced = useDebouncedCallback(handlerSetQuery, 200);

  return (
    <form
      className={cn(s.form, { [s.hasFocus]: isMapShown })}
      onSubmit={handlerSubmit}
    >
      <Svg id="search" className={s.icon} />
      <input
        type="search"
        name={inputName}
        className={cn(s.input, { [s.hasFocus]: isMapShown })}
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          debounced(e.target.value);
        }}
        onFocus={() => onShowMap()}
        placeholder="Storage Provider ID"
      />
    </form>
  );
}
