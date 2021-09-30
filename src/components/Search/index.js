import {useEffect, useState} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useQueryParam, StringParam } from 'use-query-params';
import cn from 'classnames';

import { Svg } from 'components/Svg';

import s from './s.module.css';

const inputName = 'search';

export const Search = ({ className, ...rest }) => {
  const [minerQuery, setMinerQuery] = useQueryParam('miner', StringParam);
  const [value, setValue] = useState(minerQuery);

  const handlerSetQuery = (value) => {
    setMinerQuery(value || undefined);
  };

  const debounced = useDebouncedCallback(handlerSetQuery, 200);

  const handlerSubmit = (event) => {
    debounced.cancel();
    const formData = new FormData(event.target);
    event.preventDefault();

    handlerSetQuery(formData.get(inputName));
  };

  useEffect(() => {
    setValue(minerQuery);
  }, [minerQuery]);

  return (
    <form className={cn(s.wrap, className)} onSubmit={handlerSubmit}>
      <Svg id="search" className={s.icon} />
      <input
        type="search"
        name={inputName}
        className={s.input}
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          debounced(e.target.value);
        }}
        {...rest}
      />
    </form>
  );
};
