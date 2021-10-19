import { useState, useEffect } from 'react';
import { ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import parse from 'date-fns/parse';
import sub from 'date-fns/sub';
import lightFormat from 'date-fns/lightFormat';

import { fetchChartModels } from 'api';
import {
  CHART_CATEGORY,
  DEFAULT_CHART_SCALE,
  defaultDataState,
} from 'constant';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Svg } from 'components/Svg';
import { Filters } from 'components/DataPage/Filters';
import { Chart } from 'components/Chart';
import { Spinner } from 'components/Spinner';
import { MinersTable } from './MinersTable';
import { ChartsModal } from './ChartsModal';
import s from './s.module.css';
import { getCategoryName } from '../../utils/string';

export default function DataPage() {
  const [chartModels, setChartModels] = useState(defaultDataState);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState([]);

  const [query, setQuery] = useQueryParams({
    charts: ObjectParam,
    miner: StringParam,
    start: StringParam,
    end: StringParam,
  });

  const [dateInterval, setDateInterval] = useState({
    start: query.start
      ? parse(query.start, 'yyyy-MM-dd', new Date())
      : sub(new Date(), { years: 1, days: 1 }),
    end: query.end
      ? parse(query.end, 'yyyy-MM-dd', new Date())
      : sub(new Date(), { days: 1 }),
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
        setChartModels({
          results,
          loading: false,
          failed: false,
        });

        if (query.charts) {
          setSelectedCharts(results.filter(({ id }) => query.charts?.[id]));
        } else {
          setSelectedCharts(results);
        }
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

  const getChartsQueryString = (chartsArray) => {
    return chartsArray.reduce(
      (acc, { id }) => ({
        ...acc,
        [id]: query.charts?.[id] || DEFAULT_CHART_SCALE,
      }),
      {}
    );
  };

  const handlerChangeFilter = (category) => {
    let newCharts = [];
    if (selectedCharts.every((model) => model.category === category)) {
      newCharts = chartModels.results;
    } else {
      newCharts = chartModels.results.filter(
        (item) => item.category === category
      );
    }

    setSelectedCharts(newCharts);
    setQuery((prevQuery) => ({
      ...prevQuery,
      charts: getChartsQueryString(newCharts),
    }));
  };

  const handlerCloseModal = (newSelectedCharts) => {
    if (newSelectedCharts) {
      setSelectedCharts(newSelectedCharts);
      setQuery((prevQuery) => ({
        ...prevQuery,
        charts: getChartsQueryString(newSelectedCharts),
      }));
    }

    setShowChartsModal(false);
  };

  const isFilterActive = (category) =>
    selectedCharts.length &&
    selectedCharts.every((item) => item.category === category);

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
          <Filters
            items={Object.values(CHART_CATEGORY).map((category) => ({
              children: getCategoryName(category),
              onClick: () => handlerChangeFilter(category),
              isActive: isFilterActive(category),
            }))}
          />
          <button
            type="button"
            className={s.chooseChartsButton}
            onClick={() => setShowChartsModal(true)}
          >
            <span className={s.chooseChartsButtonCounter}>
              {selectedCharts.length}
            </span>
            Charts displayed
          </button>
        </div>

        {chartModels.loading ? (
          <div className={s.noCharts}>
            <div style={{ width: '100%' }}>
              <Spinner width={24} height={24} />
            </div>
          </div>
        ) : (
          <>
            {selectedCharts.length && chartModels.results.length ? (
              selectedCharts.map((model) => {
                // const showCategory =
                //   Object.values(
                //     selectedCharts.reduce(
                //       (acc, { category }) => {
                //         acc[category] += 1;
                //         return acc;
                //       },
                //       Object.assign(
                //         ...Object.values(CHART_CATEGORY).map((category) => ({
                //           [category]: 0,
                //         }))
                //       )
                //     )
                //   ).filter(Boolean).length > 1;

                const showCategory = !Object.values(
                  CHART_CATEGORY
                ).some((category) => isFilterActive(category));

                return (
                  <Chart
                    key={model.id}
                    model={model}
                    interval={dateInterval}
                    showCategory={showCategory}
                  />
                );
              })
            ) : (
              <div className={s.noCharts}>
                <div style={{ width: '100%' }}>Select more charts.</div>
              </div>
            )}
          </>
        )}

        <MinersTable />
      </div>

      <ChartsModal
        open={showChartsModal}
        models={chartModels}
        selected={selectedCharts}
        onClose={handlerCloseModal}
      />
    </>
  );
}
