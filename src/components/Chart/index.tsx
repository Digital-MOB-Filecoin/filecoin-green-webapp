import { useEffect, useState } from 'react';
import { ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import lightFormat from 'date-fns/lightFormat';

import { fetchChart } from 'api';
import { getNormalizedScale } from 'utils/string';

import { ChartComponent } from './Chart';
import { TChartModel } from '../DataPage';

type TNormalizedChartDataData = {
  start_date: string;
  value: string;
  end_date: string;
  value0: number;
  value1?: number;
  value2?: number;
};

type TNormalizedChartData = {
  name: string;
  x: string;
  y: string;
  data: TNormalizedChartDataData[];
  meta: { title: string; color: string }[];
};

type TChart = {
  model: TChartModel;
  interval: Interval;
  showMethodologyLink?: boolean;
  showCategory?: boolean;
};

const defaultNormalizedData: TNormalizedChartData = {
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
}: TChart) => {
  const [normalizedData, setNormalizedData] = useState<TNormalizedChartData>(
    defaultNormalizedData
  );
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const [query] = useQueryParams({
    charts: ObjectParam,
    miner: StringParam,
  });

  useEffect(() => {
    const abortController = new AbortController();

    setNormalizedData(defaultNormalizedData);
    setLoading(true);
    setFailed(false);

    fetchChart(abortController, {
      id: model.id,
      start: lightFormat(interval.start, 'yyyy-MM-dd'),
      end: lightFormat(interval.end, 'yyyy-MM-dd'),
      miner: query.miner,
      filter: getNormalizedScale(query.charts?.[model.id]),
    })
      .then((response) => {
        if (!response.data[0].data.length) {
          setNormalizedData(defaultNormalizedData);
          setLoading(false);
          setFailed(false);
          return;
        }

        const normalizedChartData: TNormalizedChartDataData[] = [];
        for (let i = 0; i < response.data[0].data.length; i++) {
          let newItem: any = {};
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
      .catch((err) => {
        console.error(err);
        if (err.code !== 20) {
          setLoading(false);
          setFailed(true);
        }
        setNormalizedData(defaultNormalizedData);
      });

    return () => {
      abortController.abort('refetch');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    interval.end,
    interval.start,
    model.id,
    query.charts?.[model.id],
    query.miner,
  ]);

  return (
    <ChartComponent
      {...normalizedData}
      interval={interval}
      model={model}
      filter={getNormalizedScale(query.charts?.[model.id])}
      loading={loading}
      failed={failed}
      showMethodologyLink={showMethodologyLink}
      showCategory={showCategory}
    />
  );
};
