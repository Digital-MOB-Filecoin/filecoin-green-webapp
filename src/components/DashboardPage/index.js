import { useState, useEffect, useMemo } from 'react';
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

import sub from 'date-fns/sub';
import lightFormat from 'date-fns/lightFormat';

import {
  fetchCapacity,
  fetchCSVCapacity,
  fetchFraction,
  fetchSealed,
} from 'api';

import { Chart } from 'components/Chart';
import { Table } from 'components/Table';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Tabs } from 'components/Tabs';
import { Svg } from 'components/Svg';

import s from './s.module.css';

const defaultDataState = {
  results: [],
  loading: false,
  failed: false,
};

export default function DashboardPage() {
  const [capacityData, setCapacityData] = useState(defaultDataState);
  const [fractionData, setFractionData] = useState(defaultDataState);
  const [sealedData, setSealedData] = useState(defaultDataState);

  const [dateInterval, setDateInterval] = useState({
    start: sub(new Date(), { months: 1 }),
    end: new Date(),
  });

  const [query, setQuery] = useQueryParams({
    miner: StringParam,
    page: NumberParam,
    start: StringParam,
    end: StringParam,
    capacity: StringParam,
    fraction: StringParam,
    sealed: StringParam,
  });

  const defaultQueryParams = useMemo(
    () => ({
      start: query.start || lightFormat(dateInterval.start, 'yyyy-MM-dd'),
      end: query.end || lightFormat(dateInterval.end, 'yyyy-MM-dd'),
      capacity: undefined,
      fraction: undefined,
      sealed: undefined,
    }),
    [query.start, query.end]
  );
  // f0100786
  const handlerFetchCapacity = (abortController, query) => {
    setCapacityData({ ...defaultDataState, loading: true });

    fetchCapacity(abortController, query)
      .then((results) => {
        setCapacityData({
          ...defaultDataState,
          results,
          loaded: true,
        });
      })
      .catch((e) => {
        console.error(e);
        setCapacityData({
          ...defaultDataState,
          failed: true,
        });
      });
  };

  const handlerFetchFraction = (abortController, query) => {
    setFractionData({ ...defaultDataState, loading: true });

    fetchFraction(abortController, query)
      .then((results) => {
        setFractionData({
          ...defaultDataState,
          results,
          loaded: true,
        });
      })
      .catch((e) => {
        console.error(e);
        setFractionData({
          ...defaultDataState,
          failed: true,
        });
      });
  };

  const handlerFetchSealed = (abortController, query) => {
    setSealedData({ ...defaultDataState, loading: true });

    fetchSealed(abortController, query)
      .then((results) => {
        setSealedData({
          ...defaultDataState,
          results,
          loaded: true,
        });
      })
      .catch((e) => {
        console.error(e);
        setSealedData({
          ...defaultDataState,
          failed: true,
        });
      });
  };

  useEffect(() => {
    const abortController = new AbortController();

    const capacityQueryParams = {
      ...query,
      ...defaultQueryParams,
      filter: query.capacity || 'week',
    };
    const fractionQueryParams = {
      ...query,
      ...defaultQueryParams,
      filter: query.fraction || 'week',
    };
    const sealedQueryParams = {
      ...query,
      ...defaultQueryParams,
      filter: query.sealed || 'week',
    };

    handlerFetchCapacity(abortController, capacityQueryParams);
    handlerFetchFraction(abortController, fractionQueryParams);
    handlerFetchSealed(abortController, sealedQueryParams);

    return () => {
      abortController.abort();
    };
  }, [query.start, query.end, query.miner]);

  useEffect(() => {
    if (!capacityData.results.length) return;

    const abortController = new AbortController();
    const capacityQueryParams = {
      ...query,
      ...defaultQueryParams,
      filter: query.capacity || 'week',
    };

    handlerFetchCapacity(abortController, capacityQueryParams);
  }, [query.capacity]);

  useEffect(() => {
    if (!fractionData.results.length) return;

    const abortController = new AbortController();
    const capacityQueryParams = {
      ...query,
      ...defaultQueryParams,
      filter: query.fraction || 'week',
    };

    handlerFetchFraction(abortController, capacityQueryParams);
  }, [query.fraction]);

  useEffect(() => {
    if (!sealedData.results.length) return;

    const abortController = new AbortController();
    const capacityQueryParams = {
      ...query,
      ...defaultQueryParams,
      filter: query.sealed || 'week',
    };

    handlerFetchSealed(abortController, capacityQueryParams);
  }, [query.sealed]);

  const handlerSetDateInterval = (newDateInterval) => {
    setDateInterval(newDateInterval);

    setQuery((prevQuery) => ({
      ...prevQuery,
      start: lightFormat(newDateInterval.start, 'yyyy-MM-dd'),
      end: lightFormat(newDateInterval.end, 'yyyy-MM-dd'),
    }));
  };

  return (
    <div className="container">
      <div className={s.header}>
        <Search placeholder="Miner ID" className={s.search} />
        <Datepicker
          dateInterval={dateInterval}
          onChange={handlerSetDateInterval}
        />
      </div>
      {query.miner ? (
        <div className={s.searchContainer}>
          <span>Miner {query.miner}</span>
          <button
            type="button"
            className={s.searchClear}
            onClick={() =>
              setQuery((prevQuery) => ({
                ...prevQuery,
                miner: undefined,
              }))
            }
          >
            <Svg id="close" width={16} height={16} />
          </button>
        </div>
      ) : null}
      <div>
        <Tabs className={s.tabs} />
      </div>
      <Chart
        title="Used Capacity vs Commited Capacity"
        rangeKey="capacity"
        exportData={{
          filename: 'usedVsCommitedCapacity.csv',
          fetchFunction: fetchCSVCapacity,
          table: [
            { title: 'Epoch', key: 'epoch' },
            { title: 'Timestamp', key: 'timestamp' },
            { title: 'Commited Capacity (GiB)', key: 'commited' },
            { title: 'Used Capacity (GiB)', key: 'used' },
          ],
        }}
        data={{
          data: capacityData,
          XData: [
            {
              key: 'date',
              title: 'Timestamp',
              type: 'date',
            },
          ],
          YData: [
            {
              key: 'commited',
              title: 'Commited Capacity',
              type: 'gib',
            },
            {
              key: 'used',
              title: 'Used Capacity',
              type: 'gib',
            },
          ],
        }}
      />
      <Chart
        title="Fraction Used"
        rangeKey="fraction"
        exportData={{
          filename: 'fractionUsed.csv',
          fetchFunction: handlerFetchFraction,
          table: [
            {
              title: 'Epoch',
              key: 'epoch',
            },
            {
              title: 'Timestamp',
              key: 'date',
            },
            {
              title: 'Used Capacity (used/total)',
              key: 'fraction',
            },
          ],
        }}
        data={{
          data: fractionData,
          XData: [
            {
              key: 'date',
              title: 'Date',
              type: 'date',
            },
          ],
          YData: [
            {
              key: 'fraction',
              title: 'Used Capacity',
              type: 'percent',
            },
          ],
          // meta: [
          //   {
          //     title: 'Total capacity',
          //     value: '230003230003230003230003',
          //   },
          //   {
          //     title: 'Used capacity',
          //     value: '230003230003230003230003',
          //     percent: '50',
          //   },
          // ],
        }}
      />
      <Chart
        title="Sealed capacity added per block"
        rangeKey="sealed"
        exportData={{
          filename: 'sealedCapacityAddedPerBlock.csv',
          fetchFunction: fetchSealed,
          table: [
            {
              title: 'Timestamp',
              key: 'date',
            },
            {
              title: 'Sealing rate Used (bytes/block)',
              key: 'total',
            },
          ],
        }}
        data={{
          data: sealedData,
          XData: [
            {
              key: 'date',
              title: 'Date',
              type: 'date',
            },
          ],
          YData: [
            {
              key: 'sealed',
              title: 'Sealing rate Used',
              type: 'bytes/block',
            },
          ],
        }}
      />
      <Table />
    </div>
  );
}
