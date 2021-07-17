import { useState, useEffect } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';

import { fetchCapacity, fetchFraction, fetchSealed } from 'api';

import { convertTimestampToEpoch, convertEpochToTimestamp, convertTimestampToDate } from 'utils/dates';
import { Chart } from 'components/Chart';
import { Table } from 'components/Table';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Tabs } from 'components/Tabs';
import { Svg } from 'components/Svg';

import sub from 'date-fns/sub';

import s from './s.module.css';

const defaultDataState = {
  results: {},
  loading: false,
  failed: false,
};

export default function DashboardPage() {
  const [capacityData, setCapacityData] = useState(defaultDataState);
  const [fractionData, setFractionData] = useState(defaultDataState);
  const [sealedData, setSealedData] = useState(defaultDataState);

  const [startEpoch, setStartEpoch] = useState(
    convertTimestampToDate(sub(new Date(), { months: 4 }))
  );
  const [endEpoch, setEndEpoch] = useState(
    convertTimestampToDate(new Date())
  );

  const [minerQuery, setMinerQuery] = useQueryParam('miner', StringParam);

  useEffect(() => {
    const abortController = new AbortController();
    const defaultQueryParams = {
      capacity: { start: startEpoch, end: endEpoch },
      fraction: { start: startEpoch, end: endEpoch },
      sealed: { start: startEpoch, end: endEpoch },
    };
    setCapacityData({
      ...defaultDataState,
      loading: true,
    });
    setFractionData({
      ...defaultDataState,
      loading: true,
    });
    setSealedData({
      ...defaultDataState,
      loading: true,
    });

    fetchCapacity(abortController, { ...defaultQueryParams.capacity })
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

    fetchFraction(abortController, { ...defaultQueryParams.fraction })
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

    fetchSealed(abortController, { ...defaultQueryParams.sealed })
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

    return () => {
      abortController.abort();
    };
  }, [startEpoch, endEpoch]);

  return (
    <div className="container">
      <div className={s.header}>
        <Search placeholder="Miner ID" className={s.search} />
        <Datepicker
          startDate={new Date(startEpoch)}
          endDate={new Date(endEpoch)}
          setStartDate={(date) => {
            setStartEpoch(convertTimestampToDate(date));
          }}
          setEndDate={(date) => {
            setEndEpoch(convertTimestampToDate(date));
          }}
        />
      </div>
      {minerQuery ? (
        <div className={s.searchContainer}>
          <span>Miner {minerQuery}</span>
          <button
            type="button"
            className={s.searchClear}
            onClick={() => setMinerQuery(undefined)}
          >
            <Svg id="close" width={16} height={16} />
          </button>
        </div>
      ) : null}
      <div>
        <Tabs
          tabs={[
            {
              to: '/',
              exact: true,
              children: 'Capacity Committed and Used',
            },
            {
              to: '/energy',
              children: 'Energy',
              disabled: true,
            },
            {
              to: '/carbon',
              children: 'Carbon intensity',
              disabled: true,
            },
          ]}
          className={s.tabs}
        />
      </div>
      <Chart
        title="Used Capacity vs Commited Capacity"
        exportData={{
          filename: 'usedVsCommitedCapacity.csv',
          fetchFunction: fetchCapacity,
          table: [
            { title: 'Epoch', key: 'epoch' },
            { title: 'Commited Capacity (bytes)', key: 'commited' },
            { title: 'Used Capacity (bytes)', key: 'used' },
          ],
        }}
        data={{
          data: capacityData,
          XData: [
            {
              key: 'epoch',
              title: 'Epoch',
              type: 'epoch',
            },
          ],
          YData: [
            {
              key: 'commited',
              title: 'Commited Capacity',
              type: 'GiB',
            },
            {
              key: 'used',
              title: 'Used Capacity',
              type: 'GiB',
            },
          ],
        }}
      />
      <Chart
        title="Fraction Used"
        data={{
          data: fractionData,
          XData: [
            {
              key: 'epoch',
              title: 'Epoch',
              type: 'epoch',
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
        title="Sealed capacity added per day"
        data={{
          data: sealedData,
          XData: [
            {
              key: 'epoch',
              title: 'Epoch',
              type: 'epoch',
            },
          ],
          YData: [
            {
              key: 'sealed',
              title: 'Sealing rate Used',
              type: 'GiB/day',
            },
          ],
        }}
      />
      <Table />
    </div>
  );
}
