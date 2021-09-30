import { useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { Table } from 'components/Table';
import { Svg } from 'components/Svg';

import s from './s.module.css';

export const LeaderboardTable = () => {
  const [data, setData] = useState({
    results: Array(10)
      .fill(null)
      .map((_, idx) => ({
        id: idx,
        rank: idx + 1,
        provider: `f0${1000 * (idx + 1)}`,
        rec: `${11 * (idx + 1)} MWh`,
        used: `${7 * (idx + 1)} MWh`,
        ration: `${70 * (idx + 1)}%`,
      })),
    loading: false,
    failed: false,
  });
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

  return (
    <Table
      title="Leaderboard"
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
          title: 'Rank',
          key: 'rank',
          align: 'center',
          format: (value) => {
            let icon = null;
            if (value === 1) {
              icon = <Svg id="earth-on-heart" width={24} height={26} />;
            }
            if (value === 2) {
              icon = <Svg id="rainforest" size={24} />;
            }
            if (value === 3) {
              icon = <Svg id="sprout" width={24} height={26} />;
            }
            return (
              <div className={s.rank}>
                <div className={s.iconWrap}>{icon}</div>
                <span>{value}</span>
              </div>
            );
          },
        },
        {
          title: 'Storage provider',
          key: 'provider',
          sortKey: 'provider',
          format: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
        },
        {
          title: 'RECs purchased (30 days)',
          key: 'rec',
          sortKey: 'rec',
          format: (value) => value,
        },
        {
          title: 'Energy used (30 days)',
          key: 'used',
          sortKey: 'used',
          format: (value) => value,
        },
        {
          title: 'Ratio',
          key: 'ration',
          sortKey: 'ration',
          align: 'right',
          format: (value) => value,
        },
      ]}
    />
  );
};
