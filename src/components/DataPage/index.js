import { useState } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';

import parse from 'date-fns/parse';
import sub from 'date-fns/sub';
import lightFormat from 'date-fns/lightFormat';

import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Svg } from 'components/Svg';
import { Tabs } from 'components/Tabs';

import CapacityPage from './CapacityPage';
import EnergyPage from './EnergyPage';
import { MinerTable } from './MinerTable';
import { SelectCharts } from './SelectCharts';

import s from './s.module.css';

export default function DataPage() {
  const [query, setQuery] = useQueryParams({
    miner: StringParam,
    start: StringParam,
    end: StringParam,
  });

  const [dateInterval, setDateInterval] = useState({
    start: query.start
      ? parse(query.start, 'yyyy-MM-dd', new Date())
      : sub(new Date(), { years: 1 }),
    end: query.end ? parse(query.end, 'yyyy-MM-dd', new Date()) : new Date(),
  });

  const [showChartsModal, setShowChartsModal] = useState(false);

  const isEnergyPage = useRouteMatch('/data/energy');

  const handlerSetDateInterval = (newDateInterval) => {
    setDateInterval(newDateInterval);

    setQuery((prevQuery) => ({
      ...prevQuery,
      start: lightFormat(newDateInterval.start, 'yyyy-MM-dd'),
      end: lightFormat(newDateInterval.end, 'yyyy-MM-dd'),
    }));
  };

  return (
    <>
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
        <div className={s.tabsWrap}>
          <Tabs
            className={s.tabs}
            tabs={[
              {
                to: '/data',
                exact: true,
                children: 'Capacity Committed and Used',
              },
              {
                to: '/data/energy',
                children: 'Energy',
              },
              {
                to: '/data/carbon',
                children: 'Carbon intensity',
                disabled: true,
              },
            ]}
          />

          {isEnergyPage ? <SelectCharts /> : null}
        </div>

        <Switch>
          <Route exact path={['/data', '/data/capacity']}>
            <CapacityPage dateInterval={dateInterval} />
          </Route>
          <Route path="/data/energy">
            <EnergyPage dateInterval={dateInterval} />
          </Route>
          <Redirect to="/data" />
        </Switch>

        <MinerTable />
      </div>
    </>
  );
}
