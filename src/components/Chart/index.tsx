import { ReactElement, useEffect, useMemo, useState } from 'react';
import { DelimitedArrayParam, ObjectParam, StringParam, useQueryParams } from 'use-query-params';

import { TChartModel, fetchChart } from 'api';
import { encodeDateToQueryDate, parseIntervalFromQuery } from 'utils/dates';
import { getNormalizedScale } from 'utils/string';

import { ChartComponent } from './Chart';

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

export const Chart = ({ model, showMethodologyLink, showCategory }: TChart): ReactElement => {
  const [normalizedData, setNormalizedData] = useState<TNormalizedChartData>(defaultNormalizedData);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const [query] = useQueryParams({
    charts: ObjectParam,
    miners: DelimitedArrayParam,
    country: StringParam,
    start: StringParam,
    end: StringParam,
  });

  const interval = useMemo(() => {
    return parseIntervalFromQuery(query.start, query.end);
  }, [query.start, query.end]);

  useEffect(() => {
    const abortController = new AbortController();

    setNormalizedData(defaultNormalizedData);
    setLoading(true);
    setFailed(false);

    fetchChart({
      abortController,
      data: {
        id: model.id,
        start: encodeDateToQueryDate(interval.start),
        end: encodeDateToQueryDate(interval.end),
        miners: query.miners,
        filter: getNormalizedScale(query.charts?.[model.id]),
        country: query.country,
      },
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
          let midValue = 0;

          for (let y = 0; y < response.data.length; y++) {
            const item = response.data[y].data[i];
            midValue += Number(item.value);

            newItem = {
              ...item,
              ...newItem,
              [`value${y}`]: Number(item.value),
              // ...(response.data.length > 2
              //   ? {
              //       value_mid: response.data.length === y + 1 ? midValue / response.data.length : 0,
              //     }
              //   : {}),
            };
          }
          normalizedChartData.push(newItem);
          newItem = {};
          midValue = 0;
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
    interval.start,
    interval.end,
    model.id,
    query.charts?.[model.id],
    query.miners,
    query.miners?.length,
    query.country,
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
