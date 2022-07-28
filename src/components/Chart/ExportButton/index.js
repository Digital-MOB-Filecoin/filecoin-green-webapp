import { useState } from 'react';
import cn from 'classnames';
import { useQueryParam, StringParam } from 'use-query-params';

import { Spinner } from 'components/Spinner';

import s from './s.module.css';
import { fetchExportData } from '../../../api';
import lightFormat from 'date-fns/lightFormat';

export const ExportButton = ({ className, id, filename, interval, filter }) => {
  const [loading, setLoading] = useState(false);
  const [miner] = useQueryParam('miner', StringParam);

  const handlerExport = async () => {
    setLoading(true);

    try {
      setLoading(true);

      let offset = 0;
      let limit = 1000;
      const start = lightFormat(interval.start, 'yyyy-MM-dd');
      const end = lightFormat(interval.end, 'yyyy-MM-dd');

      let results = await fetchExportData({
        id,
        offset,
        limit,
        start,
        end,
        miner,
        filter,
      });

      const headerString = results.fields
        .map((field) => `"${field}"`)
        .join(',');
      let dataString = '';

      while (results.data.length) {
        results = await fetchExportData({
          id,
          offset,
          limit,
          start,
          end,
          miner,
          filter,
        });

        if (dataString) {
          dataString +=
            '\r\n' +
            results.data
              .map((item) =>
                results.fields
                  .map((fieldKey) => {
                    return `"${item[fieldKey]}"`;
                  })
                  .join(',')
              )
              .join('\r\n');
        } else {
          dataString += results.data
            .map((item) =>
              results.fields
                .map((fieldKey) => {
                  return `"${item[fieldKey]}"`;
                })
                .join(',')
            )
            .join('\r\n');
        }
        offset += limit;
      }

      const resultString = `${headerString}\r\n${dataString}`;

      const blob = new Blob([resultString], {
        type: 'text/csv;charset=utf-8;',
      });

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, `${filename}_${filter}.csv`);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          link.setAttribute('href', URL.createObjectURL(blob));
          link.setAttribute('download', `${filename}_${filter}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={cn(s.button, className)}
      onClick={handlerExport}
    >
      Export
      {loading ? (
        <div className={s.spinnerWrap}>
          <Spinner className={s.spinner} />
        </div>
      ) : null}
    </button>
  );
};
