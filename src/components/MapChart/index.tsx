import { useEffect, useMemo, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import {
  fetchMapChartCountries,
  fetchMapChartCountryMiners,
  fetchMapChartMinerMarkers,
  TFetchMapChartCountries,
  TFetchMapChartCountryMiners,
  TFetchMapChartMinerMarkers,
} from 'api';
import { formatBytes } from 'utils/bytes';
import { getCountryNameByCode } from 'utils/country';

import { MapChartTable, TMapChartTableRow } from './Table';
import { Map } from './Map';
import s from './s.module.css';

export function MapChart() {
  const [query, setQuery] = useQueryParams({
    miner: StringParam,
    country: StringParam,
  });
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<TFetchMapChartCountries[]>([]);
  const [countryMiners, setCountryMiners] = useState<
    TFetchMapChartCountryMiners[]
  >([]);
  const [minerMarkers, setMinerMarkers] = useState<
    TFetchMapChartMinerMarkers[]
  >([]);

  useEffect(() => {
    const abortController = new AbortController();
    setIsDataLoading(true);

    fetchMapChartCountries({ abortController })
      .then((data) => setCountries(data))
      .finally(() => setIsDataLoading(false));

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    setCountryMiners([]);
    setMinerMarkers([]);

    if (query.country) {
      setIsDataLoading(true);

      fetchMapChartCountryMiners({
        abortController,
        data: { country: query.country },
      })
        .then((data) => {
          setCountryMiners(
            data.map((item) => ({
              ...item,
              power: formatBytes(item.power, {
                precision: 2,
                inputUnit: 'GiB',
                iec: true,
              }),
            }))
          );
        })
        .finally(() => setIsDataLoading(false));
    }

    return () => {
      abortController.abort();
    };
  }, [query.country]);

  useEffect(() => {
    const abortController = new AbortController();

    setCountryMiners([]);
    setMinerMarkers([]);

    if (query.miner) {
      setIsDataLoading(true);

      setQuery((prevState) => ({
        ...prevState,
        country: undefined,
      }));

      fetchMapChartMinerMarkers({
        abortController,
        data: { miner: query.miner },
      })
        .then((data) => {
          setMinerMarkers(
            data.map((item) => ({
              ...item,
              power: formatBytes(item.power, {
                precision: 2,
                inputUnit: 'GiB',
                iec: true,
              }),
            }))
          );
        })
        .finally(() => setIsDataLoading(false));
    }

    return () => {
      abortController.abort();
    };
  }, [query.miner, setQuery]);

  const tableHeader = useMemo(() => {
    if (!query.country && !query.miner) {
      return [
        { title: 'Country' },
        { title: '# of storage providers', alignRight: true },
      ];
    }

    if (query.country) {
      return [
        { title: 'Storage provider' },
        { title: 'Total raw power', alignRight: true },
      ];
    }

    if (query.miner) {
      return [
        { title: 'Storage provider' },
        { title: 'Total raw power', alignRight: true },
      ];
    }

    return [{ title: '' }, { title: '' }];
  }, [query.country, query.miner]);

  const tableData: TMapChartTableRow[] = useMemo(() => {
    if (isDataLoading) {
      return [];
    }

    if (!query.country && !query.miner) {
      return countries.map((item) => ({
        onClick: () =>
          setQuery((prevState) => ({
            ...prevState,
            country: item.country,
          })),
        data: [
          { value: getCountryNameByCode(item.country) },
          { value: item.storage_providers, alignRight: true },
        ],
      }));
    }

    if (query.country) {
      return countryMiners.map((item) => ({
        onClick: () =>
          setQuery((prevState) => ({
            ...prevState,
            miner: item.miner,
            country: undefined,
          })),
        data: [{ value: item.miner }, { value: item.power, alignRight: true }],
      }));
    }

    if (query.miner) {
      if (minerMarkers.length) {
        return [
          {
            data: [
              { value: minerMarkers[0].miner },
              { value: minerMarkers[0].power, alignRight: true },
            ],
          },
        ];
      } else {
        return [];
      }

      // return minerMarkers.map((item) => ({
      //   data: [{ value: item.miner }, { value: item.power, alignRight: true }],
      // }));
    }

    return [];
  }, [
    isDataLoading,
    query.country,
    query.miner,
    countries,
    setQuery,
    countryMiners,
    minerMarkers,
  ]);

  const handlerBackToCountries = useMemo(() => {
    if (query.country || query.miner) {
      return () => {
        setCountryMiners([]);
        setMinerMarkers([]);
        setQuery((prevQuery) => ({
          ...prevQuery,
          miner: undefined,
          country: undefined,
        }));
      };
    }
    return undefined;
  }, [query.country, query.miner, setQuery]);

  return (
    <div className={s.wrapper}>
      <Map
        countries={countries}
        countryMiners={countryMiners}
        minerMarkers={minerMarkers}
        loading={isDataLoading}
      />
      <MapChartTable
        loading={isDataLoading}
        head={tableHeader}
        data={tableData}
        onBackToCountries={handlerBackToCountries}
      />
    </div>
  );
}
