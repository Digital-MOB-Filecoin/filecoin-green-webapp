import { ReactElement, useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { TChartModel, fetchChartModels, fetchMinerData } from 'api';
import { encodeDateToQueryDate, parseIntervalFromQuery } from 'utils/dates';
import { getNormalizedScale } from 'utils/string';

import { Chart } from 'components/Chart';
import { Filters } from 'components/DataPage/Filters';
import { FiltersBar } from 'components/FiltersBar';
import { MapChart } from 'components/MapChart';
import { Spinner } from 'components/Spinner';

import { ChartsModal } from './ChartsModal';
import { MinersTable } from './MinersTable';
import s from './s.module.css';

type MinerData = {
  id: string;
  link: string;
};

export default function DataPage(): ReactElement {
  const [query, setQuery] = useQueryParams();

  const [chartModels, setChartModels] = useState<TChartModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [showChartsModal, setShowChartsModal] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<TChartModel[]>([]);
  const [minersData, setMinersData] = useState<MinerData[]>([]);

  const [dateInterval, setDateInterval] = useState<Interval>(
    parseIntervalFromQuery(query.start, query.end),
  );

  const handlerSetDateInterval = (newDateInterval: Interval) => {
    setDateInterval(newDateInterval);

    setQuery((prevQuery) => ({
      ...prevQuery,
      start: encodeDateToQueryDate(newDateInterval.start),
      end: encodeDateToQueryDate(newDateInterval.end),
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
    if (query.miners && query.miners.length) {
      fetchMinerData({ abortController }).then(({ data }) => {
        const filteredData: MinerData[] = data.reduce((acc, item) => {
          if (item.id && query.miners?.includes(item.id)) {
            acc.push({
              id: item.id,
              link: `https://proofs.zerolabs.green/partners/filecoin/nodes/${item.id}/beneficiary`,
            });
          }
          return acc;
        }, [] as MinerData[]);

        setMinersData(filteredData);
      });
    } else {
      setMinersData([]);
    }

    return () => {
      abortController.abort();
    };
  }, [query.miners]);

  useEffect(() => {
    setDateInterval(parseIntervalFromQuery(query.start, query.end));
  }, [query.start, query.end]);

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
        <FiltersBar dateInterval={dateInterval} onChangeDateInterval={handlerSetDateInterval} />
      </div>

      <MapChart />

      {minersData?.length ? (
        <div className={s.searchContainer}>
          <div className={s.searchContainerSub}>
            Renewable energy purchases for{' '}
            {minersData.map((item, idx, self) => {
              return (
                <>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.id || '--'}
                  </a>
                  {idx + 1 < self.length ? ', ' : ''}
                </>
              );
            })}
          </div>
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
          <span className={s.chooseChartsButtonCounter}>{selectedCharts.length}</span>
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
          <Chart key={model.id} model={model} showCategory={showCategory} />
        ))
      ) : (
        <div className={s.noCharts}>
          <div style={{ width: '100%' }}>Select more charts.</div>
        </div>
      )}

      <MinersTable />

      <div className={s.notification}>
        These numbers are approximate projections based on the current network state and may be
        incorrect, do your own research
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
