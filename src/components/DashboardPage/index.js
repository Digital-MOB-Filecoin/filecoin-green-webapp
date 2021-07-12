import { Chart } from 'components/Chart';
import { Table } from 'components/Table';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Tabs } from 'components/Tabs';
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
  return (
    <div className="container">
      <div className={s.header}>
        <Search placeholder="Miner ID" className={s.search} />
        <Datepicker />
      </div>
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
        data={{
          data: getMockData(50),
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
          data: getMockData(10),
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
          data: getMockData(3),
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
