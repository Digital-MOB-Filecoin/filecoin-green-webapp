import { useState } from 'react';
import cn from 'classnames';

import { Spinner } from 'components/Spinner';

import s from './s.module.css';

export const ExportButton = ({ className, data }) => {
  const [loading, setLoading] = useState(false);

  const handlerExport = async () => {
    setLoading(true);
    const { filename, fetchFunction, table } = data;

    try {
      setLoading(true);
      const results = await fetchFunction();

      const headerString = table.map((header) => `"${header.title}"`).join(',');
      const dataString = results
        .map((row) =>
          table
            .map(({ key, format }) => {
              return `"${format ? format(row[key]) : row[key]}"`;
            })
            .join(',')
        )
        .join('\r\n');
      const resultString = `${headerString}\r\n${dataString}`;

      const blob = new Blob([resultString], {
        type: 'text/csv;charset=utf-8;',
      });

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          link.setAttribute('href', URL.createObjectURL(blob));
          link.setAttribute('download', filename);
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
