import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useQueryParam, StringParam } from 'use-query-params';
import cn from 'classnames';

import { fetchSearchMapList } from 'api';

import { getCountryNameByCode } from 'utils/country';
import { Svg } from 'components/Svg';
import { Spinner } from 'components/Spinner';
import { Datepicker } from 'components/Datepicker';
import MapChart from 'components/MapChart';

import s from './s.module.css';

const inputName = 'search';

export const FiltersBar = ({
  className,
  dateInterval,
  onChangeDateInterval,
}) => {
  const [minerQuery, setMinerQuery] = useQueryParam('miner', StringParam);
  const [value, setValue] = useState(minerQuery);
  const [showMap, setShowMap] = useState(false);
  const [data, setData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const wrapperRef = useRef();

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

  useEffect(() => {
    if (showMap) {
      setIsDataLoading(true);
      fetchSearchMapList()
        .then((data) => setData(data))
        .finally(() => setIsDataLoading(false));
    }
  }, [showMap]);

  useEffect(() => {
    const clickHandler = (e) => {
      if (!wrapperRef.current.contains(e.target)) {
        setShowMap(false);
      }
    };

    const keyboardHandler = (e) => {
      if (e.code === 'Escape') {
        setShowMap(false);
      }
    };

    if (showMap) {
      document.addEventListener('click', clickHandler);
      document.addEventListener('keyup', keyboardHandler);
    }

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keyup', keyboardHandler);
    };
  }, [showMap]);

  return (
    <div className={cn(s.wrapper, className)} ref={wrapperRef}>
      <form
        className={cn(s.form, { [s.hasFocus]: showMap })}
        onSubmit={handlerSubmit}
      >
        <Svg id="search" className={s.icon} />
        <input
          type="search"
          name={inputName}
          className={cn(s.input, { [s.hasFocus]: showMap })}
          value={value || ''}
          onChange={(e) => {
            setValue(e.target.value);
            debounced(e.target.value);
          }}
          onFocus={() => {
            setShowMap(true);
          }}
          // onBlur={() => {
          //   setShowMap(false);
          //}}
          placeholder="Storage Provider ID"
        />
      </form>
      {showMap ? (
        <div className={s.chartWrapper}>
          <MapChart width={723} height={381} data={data} />
          <div className={s.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>
                    <div>Country</div>
                  </th>
                  <th className={s.alignRight}>
                    <div># of storage providers</div>
                  </th>
                </tr>
              </thead>
              {isDataLoading ? (
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center' }}>
                      <Spinner />
                    </td>
                  </tr>
                </tbody>
              ) : null}

              {!isDataLoading ? (
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx}>
                      <td>{getCountryNameByCode(item.country)}</td>
                      <td className={s.alignRight}>{item.storage_providers}</td>
                    </tr>
                  ))}
                </tbody>
              ) : null}
            </table>
          </div>
        </div>
      ) : null}
      {showMap ? null : (
        <Datepicker
          dateInterval={dateInterval}
          onChange={onChangeDateInterval}
        />
      )}
    </div>
  );
};
