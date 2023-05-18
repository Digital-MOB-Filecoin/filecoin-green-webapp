import { ReactElement, useEffect, useMemo, useState } from 'react';
import { DelimitedArrayParam, StringParam, useQueryParams } from 'use-query-params';

import {
  TFetchMapChartCountries,
  TFetchMapChartCountryMiners,
  TFetchMapChartMinerMarkers,
  fetchMapChartCountries,
  fetchMapChartCountryMiners,
  fetchMapChartMinerMarkers,
} from 'api';
import { formatBytes } from 'utils/bytes';
import { getCountryNameByCode } from 'utils/country';

import { Map } from './Map';
import { MapChartTable, TMapChartTableRow } from './Table';
import s from './s.module.css';

export function MapChart(): ReactElement {
  const [query, setQuery] = useQueryParams({
    miners: DelimitedArrayParam,
    country: StringParam,
  });
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<TFetchMapChartCountries[]>([]);
  const [countryMiners, setCountryMiners] = useState<TFetchMapChartCountryMiners[]>([]);
  const [minerMarkers, setMinerMarkers] = useState<TFetchMapChartMinerMarkers[]>([]);

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
          const filteredData = data.filter(
            (item, pos, self) => self.findIndex((v) => v.miner === item.miner) === pos
          );

          setCountryMiners(
            filteredData.map((item) => ({
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

    if (query.miners?.length) {
      setIsDataLoading(true);

      setQuery((prevState) => ({
        ...prevState,
        country: undefined,
      }));

      fetchMapChartMinerMarkers({
        abortController,
        data: { miners: query.miners },
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
  }, [query.miners, query.miners?.length, setQuery]);

  const tableHeader = useMemo(() => {
    if (!query.country && !query.miners?.length) {
      return [{ title: 'Country' }, { title: '# of storage providers', alignRight: true }];
    }

    if (query.country) {
      return [{ title: 'Storage provider' }, { title: 'Total raw power', alignRight: true }];
    }

    if (query.miners?.length) {
      return [{ title: 'Storage provider' }, { title: 'Total raw power', alignRight: true }];
    }

    return [{ title: '' }, { title: '' }];
  }, [query.country, query.miners]);

  const tableData: TMapChartTableRow[] = useMemo(() => {
    if (isDataLoading) {
      return [];
    }

    if (!query.country && !query.miners?.length) {
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
            miners: [item.miner],
            country: undefined,
          })),
        data: [{ value: item.miner }, { value: item.power, alignRight: true }],
      }));
    }

    if (query.miners?.length) {
      const filteredData = minerMarkers.filter(
        (item, pos, self) => self.findIndex((v) => v.miner === item.miner) === pos
      );

      return filteredData.map((item) => ({
        data: [{ value: item.miner }, { value: item.power, alignRight: true }],
      }));
    }

    return [];
  }, [
    isDataLoading,
    query.country,
    query.miners,
    countries,
    setQuery,
    countryMiners,
    minerMarkers,
  ]);

  const handlerBackToCountries = useMemo(() => {
    if (query.country || query.miners?.length) {
      return () => {
        setCountryMiners([]);
        setMinerMarkers([]);
        setQuery((prevQuery) => ({
          ...prevQuery,
          miners: undefined,
          country: undefined,
        }));
      };
    }
    return undefined;
  }, [query.country, query.miners, setQuery]);

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
