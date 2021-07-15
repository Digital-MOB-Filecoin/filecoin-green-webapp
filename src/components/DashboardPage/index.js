import { useState, useEffect } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';

import { Chart } from 'components/Chart';
import { Table } from 'components/Table';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Tabs } from 'components/Tabs';
import { Svg } from 'components/Svg';
import { getRandomNumber } from 'utils/numbers';

import s from './s.module.css';
import sub from 'date-fns/sub';
import { fetchCapacity, fetchFraction, fetchSealed } from 'api';

const defaultDataState = {
  results: {},
  loading: false,
  failed: false,
};

export default function DashboardPage() {
  const [capacityData, setCapacityData] = useState(defaultDataState);
  const [fractionData, setFractionData] = useState(defaultDataState);
  const [sealedData, setSealedData] = useState(defaultDataState);

  const [startDate, setStartDate] = useState(sub(new Date(), { months: 6 }));
  const [endDate, setEndDate] = useState(new Date());

  const [minerQuery, setMinerQuery] = useQueryParam('miner', StringParam);

  useEffect(() => {
    const abortController = new AbortController();

    fetchCapacity(abortController, { all: true })
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

    fetchFraction(abortController, { all: true })
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

    fetchSealed(abortController, { all: true })
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

    return function cancel() {
      abortController.abort();
    };
  }, [startDate.getTime(), endDate.getTime()]);

  return (
    <div className="container">
      <div className={s.header}>
        <Search placeholder="Miner ID" className={s.search} />
        <Datepicker
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
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
              type: 'bytes',
            },
            {
              key: 'used',
              title: 'Used Capacity',
              type: 'bytes',
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
              type: 'date',
            },
          ],
          YData: [
            {
              key: 'fraction',
              title: 'Used Capacity',
              type: 'fraction',
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
              key: 'total',
              title: 'Sealing rate Used',
              type: 'number',
            },
          ],
        }}
      />
      <Table />
    </div>
  );
}
