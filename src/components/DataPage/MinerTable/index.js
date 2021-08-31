import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { Link } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import cn from 'classnames';

import { fetchMiners } from 'api';
import { defaultDataState } from 'constant';

import { Table } from 'components/Table';
import { formatBytes } from 'utils/bytes';

import s from './s.module.css';

const generateMinerUrl = (minerId) => {
  return (location) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('miner', minerId);

    return `${location.pathname}?${queryParams.toString()}`;
  };
};

export const MinerTable = () => {
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

    setData({ ...defaultDataState, loading: true });

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
          key: 'address',
          width: '50%',
          format: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
        },
        {
          title: 'Total raw power',
          key: 'rawPower',
          sortKey: 'rawPower',
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
          key: 'freeSpace',
          sortKey: 'freeSpace',
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
            <Link
              to={generateMinerUrl(item.address)}
              onClick={() => window.scroll({ top: 0 })}
              className={cn('button-primary', s.statisticsButton)}
            >
              View statistics
            </Link>
          ),
        },
      ]}
    />
  );
};
