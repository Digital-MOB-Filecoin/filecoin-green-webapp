import cn from 'classnames';
import { Interval } from 'date-fns';
import { ReactElement, useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { fetchChart } from 'api';
import { encodeDateToQueryDate } from 'utils/dates';
import { formatWatts } from 'utils/numbers';

// import { Spinner } from 'components/Spinner';
import { Datepicker } from 'components/Datepicker';

import { Search } from './Search';
import s from './s.module.css';

type TFiltersBar = {
  className?: string;
  dateInterval: Interval;
  onChangeDateInterval: (interval: Interval) => void;
};
export const FiltersBar = ({
  className,
  dateInterval,
  onChangeDateInterval,
}: TFiltersBar): ReactElement => {
  // const { consumption, consumptionLoading } = useConsumption(dateInterval);

  return (
    <div style={{ width: '100%', textAlign: 'right' }}>
      {/*<div style={{ marginBottom: 8 }}>*/}
      {/*  Estimate Cumulative Energy Use:{' '}*/}
      {/*  {consumptionLoading ? (*/}
      {/*    <Spinner*/}
      {/*      width={16}*/}
      {/*      height={16}*/}
      {/*      style={{ marginLeft: 4, verticalAlign: 'middle' }}*/}
      {/*    />*/}
      {/*  ) : (*/}
      {/*    consumption || 'N/A'*/}
      {/*  )}*/}
      {/*</div>*/}
      <div className={cn(s.wrapper, className)}>
        <Search />
        <Datepicker dateInterval={dateInterval} onChange={onChangeDateInterval} />
      </div>
    </div>
  );
};

function useConsumption(dateInterval: Interval) {
  const [query] = useQueryParams();
  const [consumption, setConsumption] = useState<string | null>(null);
  const [consumptionLoading, setConsumptionLoading] = useState<boolean>(false);

  useEffect(() => {
    const abortController = new AbortController();

    setConsumptionLoading(true);
    fetchChart({
      abortController,
      data: {
        code_name: 'CumulativeEnergyModel_v_1_0_1',
        start: encodeDateToQueryDate(dateInterval.start),
        end: encodeDateToQueryDate(dateInterval.end),
        miners: query.miners,
        country: query.country,
        filter: 'week',
      },
    })
      .then(({ data }) => {
        const estimateData =
          data.find((item) => item.title.toLowerCase() === 'estimate')?.data || [];

        setConsumption(
          estimateData.length
            ? formatWatts(estimateData[estimateData.length - 1].value, {
                precision: 2,
              }) + 'h'
            : null,
        );
        setConsumptionLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setConsumptionLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [dateInterval.start, dateInterval.end, query.miners, query.miners?.length, query.country]);

  return {
    consumption,
    consumptionLoading,
  };
}
