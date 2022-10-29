import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import ReactDOM from 'react-dom';
import { StringParam, useQueryParams } from 'use-query-params';
import { Interval } from 'date-fns';

import {
  fetchMapChart,
  fetchMapChartMarkers,
  TFetchMapChartMarkersResponse,
  TFetchMapChartResponse,
} from 'api';
import { getCountryNameByCode } from 'utils/country';
import { formatBytes } from 'utils/bytes';
import { Datepicker } from 'components/Datepicker';
import { MapChart } from 'components/FiltersBar/MapChart';

import { Search } from './Search';
import { MapChartTable, TMapChartTableRow } from './MapChartTable';
import s from './s.module.css';

type TFiltersBar = {
  className?: string;
  dateInterval: Interval;
  onChangeDateInterval: (interval: Interval) => void;
};
export const FiltersBar = ({
  className,
  dateInterval,
  onChangeDateInterval,
}: TFiltersBar) => {
  const [, setQuery] = useQueryParams({
    miner: StringParam,
  });
  const [showMap, setShowMap] = useState<boolean>(false);
  const [countries, setCountries] = useState<TFetchMapChartResponse>([]);
  const [markers, setMarkers] = useState<TFetchMapChartMarkersResponse>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const wrapperRef = useRef<any>();

  useEffect(() => {
    if (showMap) {
      setIsDataLoading(true);
      fetchMapChart()
        .then((data) => setCountries(data))
        .finally(() => setIsDataLoading(false));
    }

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

  const handlerFetchMapChartMarkers = useCallback((countryCode) => {
    if (!countryCode) return null;
    setSelectedCountry(countryCode);
    setIsDataLoading(true);
    setMarkers([]);

    fetchMapChartMarkers(countryCode)
      .then((data) => {
        setMarkers(
          data.map((item) => {
            // @ts-ignore
            const power: string = formatBytes(item.power, {
              precision: 2,
              inputUnit: 'GiB',
              iec: true,
            });
            const res: TFetchMapChartMarkersResponse[0] = {
              ...item,
              power,
            };
            return res;
          })
        );
      })
      .finally(() => setIsDataLoading(false));
  }, []);

  const handlerOnZoomOut = useCallback(() => {
    setMarkers([]);
    setSelectedCountry(null);
  }, []);

  const tableData: TMapChartTableRow[] = useMemo(() => {
    if (isDataLoading) {
      return [];
    }

    if (selectedCountry) {
      return markers.map((item: { miner: string; power: string }) => ({
        onClick: () => {
          setQuery((prevQuery) => ({ ...prevQuery, miner: item.miner }));
        },
        data: [
          {
            value: item.miner,
          },
          {
            value: item.power,
            alignRight: true,
          },
        ],
      }));
    }

    return countries.map(
      (item: { country: string; storage_providers: string }) => ({
        onClick: () => {
          handlerFetchMapChartMarkers(item.country);
        },
        data: [
          {
            value: getCountryNameByCode(item.country),
          },
          {
            value: item.storage_providers,
            alignRight: true,
          },
        ],
      })
    );
  }, [
    isDataLoading,
    selectedCountry,
    markers,
    countries,
    handlerFetchMapChartMarkers,
    setQuery,
  ]);

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
            selectedCountry={selectedCountry}
            onSelectCountry={handlerFetchMapChartMarkers}
            onZoomOut={handlerOnZoomOut}
          />
          <MapChartTable
            loading={isDataLoading}
            head={
              selectedCountry
                ? [
                    { title: 'Storage provider' },
                    { title: 'Total raw power', alignRight: true },
                  ]
                : [
                    { title: 'Country' },
                    { title: '# of storage providers', alignRight: true },
                  ]
            }
            data={tableData}
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
