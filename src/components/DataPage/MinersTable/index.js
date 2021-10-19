import { useEffect, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import cn from 'classnames';

import { fetchMiners } from 'api';
import { defaultDataState } from 'constant';

import { formatBytes } from 'utils/bytes';
import { Table } from 'components/Table';
import { IconButton } from 'components/IconButton';
import { Svg } from 'components/Svg';
import { SortButton } from 'components/Table/SortButton';

import s from './s.module.css';

const DesktopRow = ({ miner, power, used, onViewStatistics, highlightRow }) => {
  return (
    <tr className={cn(s.hideOnMobile, { [s.highlight]: highlightRow })}>
      <td style={{ fontWeight: 600 }}>{miner}</td>
      <td style={{ textAlign: 'right' }}>{power}</td>
      <td style={{ textAlign: 'right' }}>{used}</td>
      <td>
        <button
          type="button"
          onClick={onViewStatistics}
          className={cn('button-primary', s.statisticsButton)}
        >
          View statistics
        </button>
      </td>
    </tr>
  );
};

const MobileRow = ({ miner, power, used, onViewStatistics, highlightRow }) => {
  const [active, setActive] = useState(false);

  return (
    <tr className={cn({ [s.highlight]: highlightRow })}>
      <td colSpan={3} className={cn(s.mobileTd, { [s.active]: active })}>
        <div className={s.mobileTdInner}>
          <span className={s.mobileTdMiner}>{miner}</span>
          <span>{power}</span>
          <IconButton
            className={cn(s.mobileTdArrow, { [s.active]: active })}
            onClick={() => setActive((prevState) => !prevState)}
          >
            <Svg id="navigation_arrow-down" />
          </IconButton>
        </div>
        {active ? (
          <>
            <dl className={s.mobileDl}>
              <div>
                <dt>Commited capacity</dt>
                <dd>{used}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={onViewStatistics}
              className={cn('button-primary', s.mobileStatisticsButton)}
            >
              View statistics
            </button>
          </>
        ) : null}
      </td>
    </tr>
  );
};

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
      ThRow={
        <tr>
          <th style={{ width: '50%' }}>Entitiy</th>
          <th style={{ textAlign: 'right' }}>
            <SortButton sortKey="power">Total raw power</SortButton>
          </th>
          <th style={{ textAlign: 'right' }} className={s.hideOnMobile}>
            <SortButton sortKey="used">Committed capacity</SortButton>
          </th>
          <th />
        </tr>
      }
      TdRow={({ data, idx }) => {
        const miner = data.miner;
        const power = data.power
          ? formatBytes(data.power, {
              precision: 2,
              inputUnit: 'GiB',
            })
          : 'N/A';
        const used = data.used
          ? formatBytes(data.used, {
              precision: 2,
              inputUnit: 'GiB',
            })
          : 'N/A';
        const handlerViewStatistics = () => {
          setQuery((prevQuery) => ({
            ...prevQuery,
            miner,
          }));
          window.scroll({ top: 0 });
        };
        const highlightRow = Boolean((idx % 2) - 1);

        return (
          <>
            <MobileRow
              miner={miner}
              power={power}
              used={used}
              onViewStatistics={handlerViewStatistics}
              highlightRow={highlightRow}
            />
            <DesktopRow
              miner={miner}
              power={power}
              used={used}
              onViewStatistics={handlerViewStatistics}
              highlightRow={highlightRow}
            />
          </>
        );
      }}
    />
  );
};
