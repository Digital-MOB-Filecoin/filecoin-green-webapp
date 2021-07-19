import { Link } from 'react-router-dom';
import { getRandomNumber } from 'utils/numbers';
import { convertBytesToIEC } from 'utils/bytes';
import { Pagination } from './Pagination';
import { MINERS_TABLE_ITEMS_COUNT } from 'constant';

import s from './s.module.css';

const mockData = Array.from({ length: MINERS_TABLE_ITEMS_COUNT }).map(
  (_, idx) => ({
    id: idx,
    miner: `f${getRandomNumber(1000000, 9999999)}`,
    rawPower: `${getRandomNumber(1000000, 9999999999999)}`,
    capacity: `${getRandomNumber(1000000, 9999999999999)}`,
  })
);

export const Table = () => {
  const generateMinerUrl = (minerId) => {
    return (location) => {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set('miner', minerId);

      return `${location.pathname}?${queryParams.toString()}`;
    };
  };

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
          {mockData.map((item) => {
            return (
              <tr key={item.id}>
                <td className={s.entity}>{item.miner}</td>
                <td className={s.alignRight}>
                  {convertBytesToIEC(item.rawPower)}
                </td>
                <td className={s.alignRight}>
                  {convertBytesToIEC(item.capacity)}
                </td>
                <td className={s.alignRight}>
                  <Link
                    to={generateMinerUrl(item.miner)}
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
        totalItems={MINERS_TABLE_ITEMS_COUNT * 10}
        paramName="page"
        itemsPerPage={MINERS_TABLE_ITEMS_COUNT}
      />
    </div>
  );
};
