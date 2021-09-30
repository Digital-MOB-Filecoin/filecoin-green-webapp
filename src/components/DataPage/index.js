import { useState, useEffect, useMemo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import parse from 'date-fns/parse';
import sub from 'date-fns/sub';
import lightFormat from 'date-fns/lightFormat';

import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Svg } from 'components/Svg';
import { Tabs } from 'components/Tabs';

import { MinersTable } from './MinersTable';
import { SelectChartsModal } from './SelectChartsModal';

import s from './s.module.css';
import { fetchChartModels } from 'api';
import {
  DEFAULT_CHART_SCALE,
  defaultDataState,
  LOCALSTORAGE_SELECTED_CHARTS,
} from 'constant';
import { Chart } from 'components/Chart';

export default function DataPage() {
  const [chartModels, setChartModels] = useState(defaultDataState);
  const [showChartsModal, setShowChartsModal] = useState(false);

  const [query, setQuery] = useQueryParams({
    charts: ObjectParam,
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

  const handlerSetDateInterval = (newDateInterval) => {
    setDateInterval(newDateInterval);

    setQuery((prevQuery) => ({
      ...prevQuery,
      start: lightFormat(newDateInterval.start, 'yyyy-MM-dd'),
      end: lightFormat(newDateInterval.end, 'yyyy-MM-dd'),
    }));
  };

  useEffect(() => {
    const abortController = new AbortController();

    setChartModels((prevProps) => ({ ...prevProps, loading: true }));

    fetchChartModels(abortController)
      .then((results) => {
        if (!query.charts) {
          const storedCharts = localStorage.getItem(
            LOCALSTORAGE_SELECTED_CHARTS
          );
          if (!storedCharts) {
            localStorage.setItem(
              LOCALSTORAGE_SELECTED_CHARTS,
              JSON.stringify(results.map(({ id }) => id))
            );
          }
        }

        setChartModels({
          results,
          loading: false,
          failed: false,
        });
        setQuery((prevQuery) => {
          const newQuery = {};
          results.forEach(
            ({ id }) =>
              (newQuery[id] = query.charts?.[id] || DEFAULT_CHART_SCALE)
          );

          return {
            ...prevQuery,
            charts: newQuery,
          };
        });
        return results;
      })
      .catch((e) => {
        console.error(e);
        setChartModels({
          results: [],
          loading: false,
          failed: true,
        });
      });
  }, []);

  const userCharts = useMemo(() => {
    const storedCharts = localStorage.getItem(LOCALSTORAGE_SELECTED_CHARTS);

    if (storedCharts) {
      return JSON.parse(storedCharts);
    }

    return chartModels.results.map(({ id }) => id);
  }, [localStorage.getItem(LOCALSTORAGE_SELECTED_CHARTS)]);

  const capacityCharts = chartModels.results.filter(
    (item) => item.category === 'capacity' && userCharts.includes(item.id)
  );
  const energyCharts = chartModels.results.filter(
    (item) => item.category === 'energy' && userCharts.includes(item.id)
  );

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
          <button
            type="button"
            className={s.chooseChartsButton}
            onClick={() => setShowChartsModal(true)}
          >
            <span className={s.chooseChartsButtonCounter}>
              {chartModels.results.length}
            </span>
            Charts displayed
          </button>
        </div>
        <Switch>
          <Route exact path={['/data', '/data/capacity']}>
            {capacityCharts.length ? (
              capacityCharts.map((model) => (
                <Chart key={model.id} model={model} interval={dateInterval} />
              ))
            ) : (
              <div className={s.noCharts}>No selected charts.</div>
            )}
          </Route>
          <Route path="/data/energy">
            {energyCharts.length ? (
              energyCharts.map((model) => (
                <Chart key={model.id} model={model} interval={dateInterval} />
              ))
            ) : (
              <div className={s.noCharts}>No selected charts.</div>
            )}
          </Route>
          <Redirect to="/data" />
        </Switch>

        <MinersTable />
      </div>

      <SelectChartsModal
        data={chartModels}
        open={showChartsModal}
        onClose={() => setShowChartsModal(false)}
      />
    </>
  );
}
