import { useQueryParam, StringParam } from 'use-query-params';
import { useGeneral } from 'context/general';

import { Chart } from 'components/Chart';
import { Table } from 'components/Table';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Tabs } from 'components/Tabs';
import { Svg } from 'components/Svg';
import { getRandomNumber } from 'utils/numbers';

import s from './s.module.css';

const getMockData = (LENGTH) => {
  return Array.from({ length: LENGTH })
    .map((_, idx) => {
      const randomNumber = getRandomNumber(
        (idx + 1) * 1000,
        (idx + 1 + LENGTH * 30) * 1000
      );
      const randomNumber2 = getRandomNumber(0, 2)
        ? ((idx * LENGTH) / 5) * 100
        : ((idx * LENGTH) / -5) * 100;

      return {
        epoch: new Date().getTime() - LENGTH * (idx + 1) * 10000000,
        commited: randomNumber,
        used: randomNumber + randomNumber2,
      };
    })
    .sort((a, b) => a.epoch - b.epoch);
};

export default function DashboardPage() {
  const { generalSelectors, generalActions } = useGeneral();
  const [minerQuery, setMinerQuery] = useQueryParam('miner', StringParam);

  return (
    <div className="container">
      <div className={s.header}>
        <Search placeholder="Miner ID" className={s.search} />
        <Datepicker />
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
          fetchFunction: generalActions.fetchUsedCapacityData,
          table: [
            { title: 'Epoch', key: 'epoch' },
            { title: 'Commited Capacity (bytes)', key: 'commited' },
            { title: 'Used Capacity (bytes)', key: 'used' },
          ],
        }}
        data={{
          data: generalSelectors.usedCapacityData,
          // data: { results: getMockData(10), loading: false, loaded: true },
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
          data: { results: getMockData(10), loading: false, failed: true },
          XData: [
            {
              key: 'epoch',
              title: 'Epoch',
              type: 'date',
            },
          ],
          YData: [
            {
              key: 'used',
              title: 'Used Capacity',
              type: 'bytes',
            },
          ],
          meta: [
            {
              title: 'Total capacity',
              value: '230003230003230003230003',
            },
            {
              title: 'Used capacity',
              value: '230003230003230003230003',
              percent: '50',
            },
          ],
        }}
      />
      <Chart
        title="Sealed capacity added per block"
        data={{
          data: { results: getMockData(3), loading: false, failed: true },
          XData: [
            {
              key: 'epoch',
              title: 'Epoch',
              type: 'date',
            },
          ],
          YData: [
            {
              key: 'commited',
              title: 'Sealing rate Used',
              type: 'bytes',
            },
            {
              key: 'used',
              title: 'Sealing rate Commited',
              type: 'bytes',
            },
          ],
        }}
      />
      <Table />
    </div>
  );
}
