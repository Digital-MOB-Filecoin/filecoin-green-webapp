import cn from 'classnames';
import { ReactElement, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { TChartFiler, fetchExportData, fetchExportDataHeader } from 'api';
import { encodeDateToQueryDate } from 'utils/dates';

import { Spinner } from 'components/Spinner';

import s from './s.module.css';

type TExportButton = {
  className?: string;
  id: number;
  filename: string;
  interval: Interval;
  filter: TChartFiler;
};

export function ExportButton({
  className,
  id,
  filename,
  interval,
  filter,
}: TExportButton): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [query] = useQueryParams();
  const [error, setError] = useState<string>('');

  const handlerExport = async () => {
    const abortController = new AbortController();
    const headerAbortController = new AbortController();

    try {
      setError('');
      setLoading(true);

      let offset = 0;
      const limit = 1000;
      const start = encodeDateToQueryDate(interval.start);
      const end = encodeDateToQueryDate(interval.end);

      let results = await fetchExportData({
        abortController,
        data: {
          id,
          offset,
          limit,
          start,
          end,
          miners: query.miners,
          country: query.country,
          filter,
        },
      });

      const headers = await fetchExportDataHeader({
        abortController: headerAbortController,
        data: {
          id,
          start,
          end,
          miners: query.miners,
          country: query.country,
        },
      });

      let headerString = '';

      if (headers) {
        const commasString = Array.from({ length: results.fields.length - 1 })
          .map(() => ',')
          .join('');

        headerString =
          Object.keys(headers)
            .map((key) => {
              return `"${key}: ${headers[key]}"` + commasString;
            })
            .join('\r\n') +
          commasString +
          '\r\n';
      }

      headerString += results.fields.map((field) => `"${field}"`).join(',');

      let dataString = '';

      while (results.data.length) {
        results = await fetchExportData({
          abortController,
          data: {
            id,
            offset,
            limit,
            start,
            end,
            miners: query.miners,
            country: query.country,
            filter,
          },
        });

        if (dataString) {
          dataString +=
            '\r\n' +
            results.data
              // eslint-disable-next-line no-loop-func
              .map((item) =>
                results.fields
                  .map((fieldKey) => {
                    return `"${item[fieldKey]}"`;
                  })
                  .join(','),
              )
              .join('\r\n');
        } else {
          dataString += results.data
            // eslint-disable-next-line no-loop-func
            .map((item) =>
              results.fields
                .map((fieldKey) => {
                  return `"${item[fieldKey]}"`;
                })
                .join(','),
            )
            .join('\r\n');
        }
        offset += limit;
      }

      const resultString = `${headerString}\r\n${dataString}`;

      const blob = new Blob([resultString], {
        type: 'text/csv;charset=utf-8;',
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (navigator?.msSaveBlob) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        navigator?.msSaveBlob(blob, `${filename}_${filter}.csv`);
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
    } catch (err) {
      setError('true');
      console.error(err);
    } finally {
      setError('');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={cn(s.button, className, { [s.error]: error })}
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
}
