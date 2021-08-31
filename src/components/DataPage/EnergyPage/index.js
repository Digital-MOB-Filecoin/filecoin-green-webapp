import { useState, useEffect, useMemo } from 'react';
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

import sub from 'date-fns/sub';
import parse from 'date-fns/parse';

import { DEFAULT_CHART_SCALE, defaultDataState } from 'constant';
import { fetchCapacity, fetchFraction, fetchSealed } from 'api';

import { Chart } from 'components/Chart';
import lightFormat from 'date-fns/lightFormat';

export default function EnergyPage() {
  const [query] = useQueryParams({
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

  return (
    <>
      <CapacityChart
        miner={query.miner}
        start={
          query.start ??
          lightFormat(sub(new Date(), { years: 1 }), 'yyyy-MM-dd')
        }
        end={
          query.start ?? lightFormat(sub(new Date(), { days: 1 }), 'yyyy-MM-dd')
        }
        filter={query.capacity ?? DEFAULT_CHART_SCALE}
      />
      <FractionChart
        miner={query.miner}
        start={
          query.start ??
          lightFormat(sub(new Date(), { years: 1 }), 'yyyy-MM-dd')
        }
        end={
          query.start ?? lightFormat(sub(new Date(), { days: 1 }), 'yyyy-MM-dd')
        }
        filter={query.fraction ?? DEFAULT_CHART_SCALE}
      />
      <SealedChart
        miner={query.miner}
        start={
          query.start ??
          lightFormat(sub(new Date(), { years: 1 }), 'yyyy-MM-dd')
        }
        end={
          query.start ?? lightFormat(sub(new Date(), { days: 1 }), 'yyyy-MM-dd')
        }
        filter={query.sealed ?? DEFAULT_CHART_SCALE}
      />
    </>
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
        const results = data.map(({ commited, used, total, ...rest }) => ({
          total: Number(total),
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
      title="Used Capacity vs Total Capacity"
      rangeKey="capacity"
      interval={filter}
      exportData={{
        filename: `usedVsCommittedCapacity${miner ? `-${miner}` : ''}.csv`,
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
          { title: 'Used Capacity (GiB)', key: 'used' },
          { title: 'Total Capacity (GiB)', key: 'total' },
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
            key: 'total',
            title: 'Total Capacity',
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
          domain: [0, 'maxData'],
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
