import { useState, useEffect, useMemo } from 'react';
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

import sub from 'date-fns/sub';
import lightFormat from 'date-fns/lightFormat';
import parse from 'date-fns/parse';

import { fetchCapacity, fetchFraction, fetchSealed } from 'api';

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
  const [query, setQuery] = useQueryParams({
    miner: StringParam,
    limit: NumberParam,
    offset: NumberParam,
    total: NumberParam,
    start: StringParam,
    end: StringParam,
    capacity: StringParam,
    fraction: StringParam,
    sealed: StringParam,
    sortBy: StringParam,
    order: StringParam,
  });

  const [dateInterval, setDateInterval] = useState({
    start: query.start
      ? parse(query.start, 'yyyy-MM-dd', new Date())
      : sub(new Date(), { years: 1 }),
    end: query.end ? parse(query.end, 'yyyy-MM-dd', new Date()) : new Date(),
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
        <Search placeholder="Storage Provider ID" className={s.search} />
        <Datepicker
          dateInterval={dateInterval}
          onChange={handlerSetDateInterval}
        />
      </div>
      {query.miner ? (
        <div className={s.searchContainer}>
          <span>Storage Provider {query.miner}</span>
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
      <CapacityChart
        miner={query.miner}
        start={query.start ?? defaultQueryParams.start}
        end={query.end ?? defaultQueryParams.end}
        filter={query.capacity ?? 'week'}
      />
      <FractionChart
        miner={query.miner}
        start={query.start ?? defaultQueryParams.start}
        end={query.end ?? defaultQueryParams.end}
        filter={query.fraction ?? 'week'}
      />
      <SealedChart
        miner={query.miner}
        start={query.start ?? defaultQueryParams.start}
        end={query.end ?? defaultQueryParams.end}
        filter={query.sealed ?? 'week'}
      />
      <Table
        limit={query.limit ?? 10}
        offset={query.offset ?? 0}
        total={query.total ?? 0}
        sortBy={query.sortBy ?? undefined}
        order={query.order ?? undefined}
        setTotal={(total) =>
          setQuery((prevQuery) => ({
            ...prevQuery,
            total,
          }))
        }
        pageHandler={(page) => {
          setQuery((prevQuery) => ({
            ...prevQuery,
            offset: (page - 1) * (query.limit ?? 10),
          }));
        }}
      />
    </div>
  );
}

const CapacityChart = ({ start, end, miner, filter }) => {
  const [capacityData, setCapacityData] = useState(defaultDataState);

  useEffect(() => {
    const abortController = new AbortController();

    setCapacityData({ ...defaultDataState, loading: true });

    fetchCapacity(abortController, {
      start,
      end,
      miner,
      filter,
    })
      .then((data) => {
        const results = data.map(({ commited, used, ...rest }) => ({
          commited: Number(commited),
          used: Number(used),
          ...rest,
        }));

        setCapacityData({
          ...defaultDataState,
          results,
          failed: false,
        });
      })
      .catch((e) => {
        console.error(e);
        setCapacityData({
          ...defaultDataState,
          failed: true,
        });
      });

    return () => {
      abortController.abort();
    };
  }, [start, end, miner, filter]);

  return (
    <Chart
      title="Used Capacity vs Commited Capacity"
      rangeKey="capacity"
      interval={filter}
      exportData={{
        filename: `usedVsCommitedCapacity${miner ? `-${miner}` : ''}.csv`,
        fetchFunction: () =>
          fetchCapacity(new AbortController(), {
            start,
            end,
            miner,
            all: true,
          }),
        table: [
          { title: 'Epoch', key: 'epoch' },
          { title: 'Timestamp', key: 'timestamp' },
          { title: 'Commited Capacity (GiB)', key: 'commited' },
          { title: 'Used Capacity (GiB)', key: 'used' },
        ],
      }}
      data={{
        data: capacityData,
        xData: {
          key: 'start_date',
        },
        yData: {
          type: 'bytes',
        },
        area: [
          {
            key: 'commited',
            title: 'Commited Capacity',
          },
          {
            key: 'used',
            title: 'Used Capacity',
          },
        ],
      }}
    />
  );
};

const FractionChart = ({ start, end, miner, filter }) => {
  const [fractionData, setFractionData] = useState(defaultDataState);

  useEffect(() => {
    const abortController = new AbortController();

    setFractionData({ ...defaultDataState, loading: true });

    fetchFraction(abortController, {
      start,
      end,
      miner,
      filter,
    })
      .then((data) => {
        const results = data.map(({ fraction, ...rest }) => ({
          fraction: Number(fraction),
          ...rest,
        }));

        setFractionData({
          ...defaultDataState,
          results,
          failed: false,
        });
      })
      .catch((e) => {
        console.error(e);
        setFractionData({
          ...defaultDataState,
          failed: true,
        });
      });

    return () => {
      abortController.abort();
    };
  }, [start, end, miner, filter]);

  return (
    <Chart
      title="Fraction Used"
      rangeKey="fraction"
      interval={filter}
      exportData={{
        filename: `fractionUsed${miner ? `-${miner}` : ''}.csv`,
        fetchFunction: () =>
          fetchFraction(new AbortController(), {
            start,
            end,
            miner,
            all: true,
          }),
        table: [
          {
            title: 'Epoch',
            key: 'epoch',
          },
          {
            title: 'Timestamp',
            key: 'timestamp',
          },
          {
            title: 'Used Capacity (used/total)',
            key: 'fraction',
          },
        ],
      }}
      data={{
        data: fractionData,
        xData: {
          key: 'start_date',
        },

        yData: {
          type: 'percent',
        },
        area: [
          {
            key: 'fraction',
            title: 'Used Capacity',
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
  );
};

const SealedChart = ({ start, end, miner, filter }) => {
  const [sealedData, setSealedData] = useState(defaultDataState);

  useEffect(() => {
    const abortController = new AbortController();

    setSealedData({ ...defaultDataState, loading: true });

    fetchSealed(abortController, {
      start,
      end,
      miner,
      filter,
    })
      .then((data) => {
        const results = data.map(({ sealed, ...rest }) => ({
          sealed: Number(sealed),
          ...rest,
        }));

        setSealedData({
          ...defaultDataState,
          results,
          failed: false,
        });
      })
      .catch((e) => {
        console.error(e);
        setSealedData({
          ...defaultDataState,
          failed: true,
        });
      });

    return () => {
      abortController.abort();
    };
  }, [start, end, miner, filter]);

  return (
    <Chart
      title="Committed capacity added per day"
      rangeKey="sealed"
      interval={filter}
      exportData={{
        filename: `committedCapacityAddedPerDay${miner ? `-${miner}` : ''}.csv`,
        fetchFunction: () =>
          fetchSealed(new AbortController(), {
            start,
            end,
            miner,
            all: true,
          }),
        table: [
          {
            title: 'Epoch',
            key: 'epoch',
          },
          {
            title: 'Timestamp',
            key: 'timestamp',
          },
          {
            title: 'Capacity per day (GiB/day)',
            key: 'sealed',
          },
        ],
      }}
      data={{
        data: sealedData,
        xData: {
          key: 'start_date',
        },
        yData: {
          type: 'bytes',
        },
        area: [
          {
            key: 'sealed',
            title: 'Capacity per day',
          },
        ],
      }}
    />
  );
};
