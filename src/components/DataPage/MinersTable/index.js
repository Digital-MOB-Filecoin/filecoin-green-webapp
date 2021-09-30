import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import cn from 'classnames';

import { fetchMiners } from 'api';
import { defaultDataState } from 'constant';

import { Table } from 'components/Table';
import { formatBytes } from 'utils/bytes';

import s from './s.module.css';

export const MinersTable = () => {
  const [data, setData] = useState(defaultDataState);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useQueryParams({
    miner: StringParam,
    limit: NumberParam,
    offset: NumberParam,
    start: StringParam,
    end: StringParam,
    sortBy: StringParam,
    order: StringParam,
  });

  useEffect(() => {
    const abortController = new AbortController();

    setData((prevProps) => ({ ...prevProps, loading: true }));

    fetchMiners(abortController, {
      limit: query.limit ?? 10,
      offset: query.offset ?? 0,
      sortBy: query.sortBy ?? undefined,
      order: query.order ?? undefined,
    })
      .then((result) => {
        setData({
          results: result.miners,
          loading: false,
          failed: false,
        });

        setTotal(result.pagination.total);
      })
      .catch((e) => {
        console.error(e);
        setData({
          results: [],
          loading: false,
          failed: true,
        });
      });
  }, [query.limit, query.offset, query.sortBy, query.order]);

  return (
    <Table
      title="Storage Providers"
      className={s.table}
      data={data}
      limit={query.limit ?? 10}
      offset={query.offset ?? 0}
      total={total}
      pageHandler={(page) => {
        setQuery((prevQuery) => ({
          ...prevQuery,
          offset: (page - 1) * (query.limit ?? 10),
        }));
      }}
      columns={[
        {
          title: 'Entitiy',
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
                  miner: item.miner,
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
