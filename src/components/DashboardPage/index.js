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
  });

  const [dateInterval, setDateInterval] = useState({
    start: query.start
      ? parse(query.start, 'yyyy-MM-dd', new Date())
      : sub(new Date(), { months: 1 }),
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
        const results = data.map(({ date, commited, used }) => ({
          date,
          commited: Number(commited),
          used: Number(used),
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
        const results = data.map(({ date, fraction }) => ({
          date,
          fraction: Number(fraction),
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
        const results = data.map(({ date, sealed }) => ({
          date,
          sealed: Number(sealed),
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
      title="Sealed capacity added per day"
      rangeKey="sealed"
      exportData={{
        filename: `sealedCapacityAddedPerBlock${miner ? `-${miner}` : ''}.csv`,
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
            title: 'Sealing rate Used (GiB/day)',
            key: 'sealed',
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
            type: 'bytes/day',
          },
        ],
      }}
    />
  );
};
