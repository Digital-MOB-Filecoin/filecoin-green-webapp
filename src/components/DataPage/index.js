import { useState, useEffect } from 'react';
import { ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import dateParse from 'date-fns/parse';
import dateSub from 'date-fns/sub';
import dateLightFormat from 'date-fns/lightFormat';
import dateIsValid from 'date-fns/isValid';

import { fetchChartModels, fetchMinerData } from 'api';
import { MAX_DATEPICKER_DATE, defaultDataState } from 'constant';
import { getNormalizedScale } from 'utils/string';
import { Search } from 'components/Search';
import { Datepicker } from 'components/Datepicker';
import { Svg } from 'components/Svg';
import { Filters } from 'components/DataPage/Filters';
import { Chart } from 'components/Chart';
import { Spinner } from 'components/Spinner';

import { MinersTable } from './MinersTable';
import { ChartsModal } from './ChartsModal';
import s from './s.module.css';

export default function DataPage() {
  const [chartModels, setChartModels] = useState(defaultDataState);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [minerData, setMinerData] = useState(null);

  const [query, setQuery] = useQueryParams({
    charts: ObjectParam,
    miner: StringParam,
    start: StringParam,
    end: StringParam,
  });

  const [dateInterval, setDateInterval] = useState(() => {
    const parsedStartDate = query.start
      ? dateParse(query.start, 'yyyy-MM-dd', new Date())
      : null;

    const parsedEndDate = query.end
      ? dateParse(query.end, 'yyyy-MM-dd', new Date())
      : null;

    if (!dateIsValid(parsedStartDate) || !dateIsValid(parsedEndDate)) {
      return {
        start: dateSub(MAX_DATEPICKER_DATE, { months: 6 }),
        end: MAX_DATEPICKER_DATE,
      };
    }

    if (parsedStartDate.getTime() > parsedEndDate.getTime()) {
      return {
        start: parsedEndDate,
        end: parsedStartDate,
      };
    }

    return {
      start: parsedStartDate,
      end: parsedEndDate,
    };
  });

  const handlerSetDateInterval = (newDateInterval) => {
    setDateInterval(newDateInterval);

    setQuery((prevQuery) => ({
      ...prevQuery,
      start: dateLightFormat(newDateInterval.start, 'yyyy-MM-dd'),
      end: dateLightFormat(newDateInterval.end, 'yyyy-MM-dd'),
    }));
  };

  useEffect(() => {
    if (query.miner) {
      fetchMinerData(query.miner).then((data) => {
        setMinerData(data?.miners?.[0]);
      });
    } else {
      setMinerData(null);
    }
  }, [query.miner]);

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
      charts: newCharts.reduce((acc, { id }) => {
        return {
          ...acc,
          [id]: getNormalizedScale(query.charts?.[id]),
        };
      }, {}),
    }));
  };

  const handlerCloseModal = (newSelectedCharts) => {
    if (newSelectedCharts) {
      setSelectedCharts(newSelectedCharts);
      setQuery((prevQuery) => ({
        ...prevQuery,
        charts: newSelectedCharts.reduce((acc, { id }) => {
          return {
            ...acc,
            [id]: getNormalizedScale(query.charts?.[id]),
          };
        }, {}),
      }));
    }

    setShowChartsModal(false);
  };

  const showCategory =
    selectedCharts.some(({ category }) => category === 'capacity') &&
    selectedCharts.some(({ category }) => category === 'energy');

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
            {minerData?.energy?.pageUrl ? (
              <div className={s.searchContainerSub}>
                Renewable energy purchases for{' '}
                <a
                  href={minerData.energy.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {minerData?.address || '--'}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={s.tabsWrap}>
          <Filters
            className={s.tabs}
            items={[
              {
                children: 'Capacity',
                onClick: () => handlerChangeFilter('capacity'),
                isActive:
                  selectedCharts.length &&
                  selectedCharts.every((item) => item.category === 'capacity'),
              },
              {
                children: 'Energy',
                onClick: () => handlerChangeFilter('energy'),
                isActive:
                  selectedCharts.length &&
                  selectedCharts.every((item) => item.category === 'energy'),
              },
              // {
              //   children: 'Carbon intensity',
              //   disabled: true,
              // },
            ]}
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
              selectedCharts.map((model) => (
                <Chart
                  key={model.id}
                  model={model}
                  interval={dateInterval}
                  showCategory={showCategory}
                />
              ))
            ) : (
              <div className={s.noCharts}>
                <div style={{ width: '100%' }}>Select more charts.</div>
              </div>
            )}
          </>
        )}

        <MinersTable />

        <div className={s.notification}>
          These numbers are approximate projections based on the current network
          state and may be incorrect, do your own research
        </div>
      </div>

      <ChartsModal
        models={chartModels}
        selected={selectedCharts}
        open={showChartsModal}
        onClose={handlerCloseModal}
      />
    </>
  );
}
