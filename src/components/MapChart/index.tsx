import { ReactElement, useEffect, useState } from 'react';

import { TFetchMapChartCountries, fetchMapChartCountries } from 'api';
import { getCountryNameByCode } from 'utils/country';

import { Map } from './Map';
import { MapChartTable, TMapChartTableRow } from './Table';
import s from './s.module.css';

export function MapChart(): ReactElement {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<TFetchMapChartCountries[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    setIsDataLoading(true);

    fetchMapChartCountries({ abortController })
      .then((data) => setCountries(data))
      .finally(() => setIsDataLoading(false));

    return () => {
      abortController.abort();
    };
  }, []);

  const tableData: TMapChartTableRow[] = isDataLoading
    ? []
    : countries.map((item) => ({
        data: [
          { value: getCountryNameByCode(item.country) },
          { value: item.storage_providers, alignRight: true },
        ],
      }));

  return (
    <div className={s.wrapper}>
      <Map countries={countries} loading={isDataLoading} />
      <MapChartTable
        loading={isDataLoading}
        head={[{ title: 'Country' }, { title: '# of storage providers', alignRight: true }]}
        data={tableData}
      />
    </div>
  );
}
