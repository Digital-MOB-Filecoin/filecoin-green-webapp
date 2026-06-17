import cn from 'classnames';
import { ReactElement } from 'react';

import { TChartFiler } from 'api';
import { TNormalizedChartData } from 'components/Chart';

import s from './s.module.css';

type TExportButton = {
  className?: string;
  filename: string;
  filter: TChartFiler;
  data: TNormalizedChartData['data'];
  meta: TNormalizedChartData['meta'];
};

export function ExportButton({ className, filename, filter, data, meta }: TExportButton): ReactElement {
  const handlerExport = () => {
    const seriesTitles = meta.map((m) => m.title);

    const header = ['"start_date"', '"end_date"', ...seriesTitles.map((t) => `"${t}"`)].join(',');

    const rows = data.map((point) => {
      const values = meta.map((_, idx) => {
        const raw = point[`value${idx}`];
        return raw != null ? `"${raw}"` : '""';
      });
      return [`"${point.start_date}"`, `"${point.end_date}"`, ...values].join(',');
    });

    const csv = [header, ...rows].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${filename}_${filter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      className={cn(s.button, className)}
      onClick={handlerExport}
      disabled={!data.length}
    >
      Export
    </button>
  );
}
