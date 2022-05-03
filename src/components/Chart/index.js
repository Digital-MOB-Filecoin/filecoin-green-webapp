import { useEffect, useState } from 'react';
import { ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import lightFormat from 'date-fns/lightFormat';

import { DEFAULT_CHART_SCALE } from 'constant';
import { fetchChart } from 'api';

import { ChartComponent } from './Chart';

const defaultDataState = {
  id: null,
  name: '',
  data: [],
  meta: [],
  x: '',
  y: '',
};

export const Chart = ({
  model,
  interval,
  showMethodologyLink,
  showCategory,
}) => {
  const [normalizedData, setNormalizedData] = useState(defaultDataState);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const [query] = useQueryParams({
    charts: ObjectParam,
    miner: StringParam,
  });

  const fetchChartData = (abortController) => {
    setNormalizedData(defaultDataState);
    setLoading(true);
    setFailed(false);

    fetchChart(abortController, {
      id: model.id,
      start: lightFormat(interval.start, 'yyyy-MM-dd'),
      end: lightFormat(interval.end, 'yyyy-MM-dd'),
      miner: query.miner,
      filter: query.charts?.[model.id] ?? DEFAULT_CHART_SCALE,
    })
      .then((response) => {
        if (!response.data[0].data.length) {
          setNormalizedData(defaultDataState);
          setLoading(false);
          setFailed(false);
          return;
        }

        const normalizedChartData = [];
        for (let i = 0; i < response.data[0].data.length; i++) {
          let newItem = {};
          for (let y = 0; y < response.data.length; y++) {
            const item = response.data[y].data[i];
            newItem = {
              ...item,
              ...newItem,
              [`value${y}`]: Number(item.value),
            };
          }
          normalizedChartData.push(newItem);
          newItem = {};
        }

        setNormalizedData({
          name: response.name,
          x: response.x,
          y: response.y,
          data: normalizedChartData,
          meta: normalizedChartData.length
            ? response.data.map(({ title, color }) => ({ title, color }))
            : [],
        });
        setLoading(false);
        setFailed(false);
      })
      .catch((e) => {
        console.error(e);
        setNormalizedData(defaultDataState);
        setLoading(false);
        setFailed(true);
      });
  };

  useEffect(() => {
    const abortController = new AbortController();

    fetchChartData(abortController);

    return () => {
      return abortController.abort();
    };
  }, [
    interval.start.getTime(),
    interval.end.getTime(),
    query.miner,
    query.charts?.[model.id],
  ]);

  return (
    <ChartComponent
      {...normalizedData}
      interval={interval}
      model={model}
      filter={query.charts?.[model.id] || DEFAULT_CHART_SCALE}
      loading={loading}
      failed={failed}
      showMethodologyLink={showMethodologyLink}
      showCategory={showCategory}
    />
  );
};
