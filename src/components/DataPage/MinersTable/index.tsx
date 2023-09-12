import cn from 'classnames';
import { nanoid } from 'nanoid';
import { ReactElement, useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { TFetchMinersResponseMiners, fetchMiners } from 'api';
import { formatBytes } from 'utils/bytes';

import { Table } from 'components/Table';

import s from './s.module.css';

export const MinersTable = (): ReactElement => {
  const [data, setData] = useState<TFetchMinersResponseMiners[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useQueryParams();

  useEffect(() => {
    const abortController = new AbortController();

    setLoading(true);

    fetchMiners({
      abortController,
      data: {
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
        sortBy: query.sortBy ?? undefined,
        order: query.order ?? undefined,
      },
    })
      .then((result) => {
        setData(result.miners);
        setLoading(false);
        setFailed(false);

        setTotal(Number(result.pagination.total));
      })
      .catch((e) => {
        console.error(e);
        setData([]);
        setLoading(false);
        setFailed(true);
      });
  }, [query.limit, query.offset, query.sortBy, query.order]);

  return (
    <Table
      title="Storage Providers"
      className={s.table}
      data={data}
      loading={loading}
      failed={failed}
      limit={query.limit ?? 10}
      offset={query.offset ?? 0}
      total={total}
      onChangePage={(page) => {
        setQuery((prevQuery) => ({
          ...prevQuery,
          offset: (page - 1) * (query.limit ?? 10),
        }));
      }}
      columns={[
        {
          title: 'Entity',
          key: 'miner',
          width: '50%',
          format: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
        },
        {
          title: 'Total raw power',
          key: 'power',
          sortKey: 'power',
          align: 'right',
          format: (value) =>
            value
              ? formatBytes(value, {
                  precision: 2,
                  inputUnit: 'GiB',
                })
              : 'N/A',
        },
        {
          title: 'Committed capacity',
          key: 'used',
          sortKey: 'used',
          align: 'right',
          format: (value) =>
            value
              ? formatBytes(value, {
                  precision: 2,
                  inputUnit: 'GiB',
                })
              : 'N/A',
        },
        {
          title: '',
          key: nanoid(),
          format: (_, item) => (
            <button
              type="button"
              onClick={() => {
                setQuery((prevQuery) => ({
                  ...prevQuery,
                  miners: [item.miner],
                }));
                window.scroll({ top: 0 });
              }}
              className={cn('button-primary', s.statisticsButton)}
            >
              View statistics
            </button>
          ),
        },
      ]}
    />
  );
};
