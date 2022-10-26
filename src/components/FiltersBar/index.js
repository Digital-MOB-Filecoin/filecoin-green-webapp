import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import ReactDOM from 'react-dom';

import { fetchMapChart, fetchMapChartMarkers } from 'api';
import { getCountryNameByCode } from 'utils/country';
import { formatBytes } from 'utils/bytes';
import { Datepicker } from 'components/Datepicker';
import { MapChart } from 'components/FiltersBar/MapChart';

import { Search } from './Search';
import { ChartTable } from './ChartTable';
import s from './s.module.css';

export const FiltersBar = ({
  className,
  dateInterval,
  onChangeDateInterval,
}) => {
  const [showMap, setShowMap] = useState(true);
  const [countries, setCountries] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const wrapperRef = useRef();

  useEffect(() => {
    if (showMap) {
      setIsDataLoading(true);
      fetchMapChart()
        .then((data) => setCountries(data))
        .finally(() => setIsDataLoading(false));
    }
  }, [showMap]);

  useEffect(() => {
    const clickHandler = (e) => {
      if (!ReactDOM.findDOMNode(wrapperRef.current)?.contains(e.target)) {
        setShowMap(false);
      }
    };

    const keyboardHandler = (e) => {
      if (e.code === 'Escape') {
        setShowMap(false);
      }
    };

    if (showMap) {
      document.addEventListener('click', clickHandler, { capture: true });
      document.addEventListener('keyup', keyboardHandler, { capture: true });
    }

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keyup', keyboardHandler);
    };
  }, [showMap]);

  const handlerFetchMapChartCountry = (countryCode) => {
    if (!countryCode) return null;
    setSelectedCountry(countryCode);
    setIsDataLoading(true);

    fetchMapChartMarkers(countryCode)
      .then((data) => setMarkers(data))
      .finally(() => setIsDataLoading(false));
  };

  const handlerOnZoomOut = () => {
    setMarkers([]);
    setSelectedCountry(null);
  };

  const getTableColumns = () => {
    const temp = {
      head: [{ title: '' }, { title: '' }],
      data: [],
    };

    if (isDataLoading) {
      return temp;
    }

    if (selectedCountry) {
      temp.head = [
        { title: 'Storage provider' },
        { title: 'Total raw power', alignRight: true },
      ];
      temp.data = markers.map((item) => [
        {
          value: item.miner,
        },
        {
          value: formatBytes(item.power, {
            precision: 2,
            inputUnit: 'GiB',
            iec: true,
          }),
          alignRight: true,
        },
      ]);

      return temp;
    }

    temp.head = [
      { title: 'Country' },
      { title: '# of storage providers', alignRight: true },
    ];
    temp.data = countries.map((item) => [
      {
        value: getCountryNameByCode(item.country),
      },
      {
        value: item.storage_providers,
        alignRight: true,
      },
    ]);

    return temp;
  };

  return (
    <div className={cn(s.wrapper, className)} ref={wrapperRef}>
      <Search onShowMap={() => setShowMap(true)} isMapShown={showMap} />

      {showMap ? (
        <div className={s.chartWrapper}>
          <MapChart
            width={723}
            height={381}
            countries={countries}
            markers={markers}
            loading={isDataLoading}
            onSelectCountry={handlerFetchMapChartCountry}
            selectedCountry={selectedCountry}
            onZoomOut={handlerOnZoomOut}
          />
          <ChartTable
            loading={isDataLoading}
            columns={getTableColumns()}
            onBackToCountries={
              !isDataLoading && selectedCountry ? handlerOnZoomOut : undefined
            }
          />
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
