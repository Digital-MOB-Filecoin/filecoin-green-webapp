import { Link } from 'react-router-dom';
import { formatBytes } from 'utils/bytes';
import { Pagination } from './Pagination';
import { useQueryParams, StringParam, NumberParam } from 'use-query-params';

import s from './s.module.css';
import { useEffect, useState } from 'react';
import { fetchMiners } from 'api';

const generateMinerUrl = (minerId) => {
  return (location) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('miner', minerId);

    return `${location.pathname}?${queryParams.toString()}`;
  };
};

const defaultDataState = {
  results: [],
  loading: false,
  failed: false,
};

export const Table = ({ limit, offset, total, setTotal, pageHandler }) => {
  const [data, setData] = useState(defaultDataState);

  useEffect(() => {
    const abortController = new AbortController();

    setData({ ...defaultDataState, loading: true });

    fetchMiners(abortController, {
      limit,
      offset,
    })
      .then((data) => {
        setData({
          results: data.miners,
          loading: false,
          failed: false,
        });

        setTotal(data.pagination.total);
      })
      .catch((e) => {
        console.error(e);
        setData({
          results: [],
          loading: false,
          failed: true,
        });
      });
  }, [limit, offset]);

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h2 className="h2">Miners</h2>
      </div>
      <table className={s.table}>
        <thead>
          <tr>
            <th className={s.entity}>Entity</th>
            <th className={s.alignRight}>Total raw power</th>
            <th className={s.alignRight}>Commited capacity</th>
            <th className={s.alignRight} />
          </tr>
        </thead>
        <tbody>
          {data.results.map((item) => {
            return (
              <tr key={item.id}>
                <td className={s.entity}>{item.address}</td>
                <td className={s.alignRight}>
                  {item.rawPower
                    ? formatBytes(item.rawPower, {
                        // inputUnit: 'GiB',
                        precision: 2,
                      })
                    : 'N/A'}
                </td>
                <td className={s.alignRight}>
                  {item.freeSpace
                    ? formatBytes(item.freeSpace, {
                        // inputUnit: 'GiB',
                        precision: 2,
                      })
                    : 'N/A'}
                </td>
                <td className={s.alignRight}>
                  <Link
                    to={generateMinerUrl(item.address)}
                    onClick={() => window.scroll({ top: 0 })}
                    className={s.statisticsButton}
                  >
                    View statistics
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        skip={offset}
        take={limit}
        total={total}
        pageHandler={pageHandler}
      />
    </div>
  );
};
