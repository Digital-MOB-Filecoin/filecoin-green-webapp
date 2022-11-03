import { useState, useEffect } from 'react';
import { ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import {
  parse as dateParse,
  sub as dateSub,
  lightFormat as dateLightFormat,
  isValid as dateIsValid,
  getTime as dateGetTime,
} from 'date-fns';

import { fetchChartModels, fetchMinerData } from 'api';
import { MAX_DATEPICKER_DATE } from 'constant';
import { getNormalizedScale } from 'utils/string';
import { FiltersBar } from 'components/FiltersBar';
import { Svg } from 'components/Svg';
import { Filters } from 'components/DataPage/Filters';
import { Chart } from 'components/Chart';
import { Spinner } from 'components/Spinner';
import { MapChart } from 'components/MapChart';

import { MinersTable } from './MinersTable';
import { ChartsModal } from './ChartsModal';
import s from './s.module.css';

export type TChartModel = {
  id: number;
  name: string;
  code_name: string;
  category: 'capacity' | 'energy';
  details: string;
};

export default function DataPage() {
  const [query, setQuery] = useQueryParams({
    charts: ObjectParam,
    miner: StringParam,
    start: StringParam,
    end: StringParam,
  });

  const [chartModels, setChartModels] = useState<TChartModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<TChartModel[]>([]);
  const [minerData, setMinerData] = useState<any>(null);

  const [dateInterval, setDateInterval] = useState<Interval>(() => {
    const parsedStartDate = query.start
      ? dateParse(query.start, 'yyyy-MM-dd', new Date()).getTime()
      : undefined;

    const parsedEndDate = query.end
      ? dateParse(query.end, 'yyyy-MM-dd', new Date()).getTime()
      : undefined;

    if (
      !parsedStartDate ||
      !parsedEndDate ||
      !dateIsValid(parsedStartDate) ||
      !dateIsValid(parsedEndDate)
    ) {
      return {
        start: dateGetTime(dateSub(MAX_DATEPICKER_DATE, { months: 6 })),
        end: dateGetTime(MAX_DATEPICKER_DATE),
      };
    }

    if (parsedStartDate > parsedEndDate) {
      return {
        start: dateGetTime(parsedEndDate),
        end: dateGetTime(parsedStartDate),
      };
    }

    return {
      start: dateGetTime(parsedStartDate),
      end: dateGetTime(parsedEndDate),
    };
  });

  const handlerSetDateInterval = (newDateInterval: Interval) => {
    setDateInterval(newDateInterval);

    setQuery((prevQuery) => ({
      ...prevQuery,
      start: dateLightFormat(newDateInterval.start, 'yyyy-MM-dd'),
      end: dateLightFormat(newDateInterval.end, 'yyyy-MM-dd'),
    }));
  };

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    setFailed(false);

    fetchChartModels({ abortController })
      .then((results) => {
        setChartModels(results);
        setFailed(false);
        setLoading(false);

        if (query.charts) {
          setSelectedCharts(results.filter(({ id }) => query.charts?.[id]));
        } else {
          setSelectedCharts(results);
        }
      })
      .catch((err) => {
        console.error(err);
        setChartModels([]);
        setLoading(false);
        setFailed(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    if (query.miner) {
      fetchMinerData({ abortController, data: { miner: query.miner } }).then(
        (data) => {
          setMinerData(data?.miners?.[0]);
        }
      );
    } else {
      setMinerData(null);
    }

    return () => {
      abortController.abort();
    };
  }, [query.miner]);

  const handlerChangeFilter = (category: TChartModel['category']) => {
    let newCharts: TChartModel[] = [];
    if (selectedCharts.every((model) => model.category === category)) {
      newCharts = chartModels;
    } else {
      newCharts = chartModels.filter((item) => item.category === category);
    }

    setSelectedCharts(newCharts);
    setQuery((prevQuery) => ({
      ...prevQuery,
      charts:
        newCharts.length === chartModels.length
          ? undefined
          : newCharts.reduce((acc, { id }) => {
              return {
                ...acc,
                [id]: getNormalizedScale(query.charts?.[id]),
              };
            }, {}),
    }));
  };

  const handlerCloseModal = (newSelectedCharts?: TChartModel[]) => {
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
    <div className="container">
      <div className={s.header}>
        <FiltersBar
          dateInterval={dateInterval}
          onChangeDateInterval={handlerSetDateInterval}
        />
      </div>

      <MapChart />

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
              isActive: selectedCharts.length
                ? selectedCharts.every((item) => item.category === 'capacity')
                : false,
            },
            {
              children: 'Energy',
              onClick: () => handlerChangeFilter('energy'),
              isActive: selectedCharts.length
                ? selectedCharts.every((item) => item.category === 'energy')
                : false,
            },
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

      {loading ? (
        <div className={s.noCharts}>
          <div style={{ width: '100%' }}>
            <Spinner width={24} height={24} />
          </div>
        </div>
      ) : failed ? (
        <div className={s.noCharts}>
          <div style={{ width: '100%' }}>Failed to Load Data.</div>
        </div>
      ) : selectedCharts.length && chartModels.length ? (
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

      <MinersTable />

      <div className={s.notification}>
        These numbers are approximate projections based on the current network
        state and may be incorrect, do your own research
      </div>
      <ChartsModal
        loading={loading}
        failed={failed}
        models={chartModels}
        selected={selectedCharts}
        open={showChartsModal}
        onClose={handlerCloseModal}
      />
    </div>
  );
}
