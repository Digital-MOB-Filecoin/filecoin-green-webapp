import { Chart } from 'components/Chart';
import { MinersTable } from 'components/MinersTable';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Tabs } from 'components/Tabs';

const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getMockData = () =>
  Array.from({ length: 30 })
    .map(() => ({
      name: 'Name',
      uv: getRandomNumber(0, 10000),
      pv: getRandomNumber(0, 10000),
      amt: getRandomNumber(0, 10000),
    }))
    .sort((a, b) => a.uv - b.uv);

const tabs = [
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
];

export default function DashboardPage() {
  return (
    <div className="container">
      <div>
        <Search placeholder="Miner ID" />
        <Datepicker />
      </div>
      <div>
        <Tabs tabs={tabs} />
      </div>
      <Chart data={getMockData()} title="Used Capacity vs Commited Capacity" />
      <Chart data={getMockData()} title="Fraction Used" />
      <Chart data={getMockData()} title="Sealed capacity added per block" />
      <MinersTable />
    </div>
  );
}
