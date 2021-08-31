import { useEffect, useState } from 'react';
import { fetchCapacity } from 'api';

import { defaultDataState } from 'constant';
import { Chart } from 'components/Chart';

export const EnergyChart = ({ start, end, miner, filter }) => {
  const [capacityData, setCapacityData] = useState(defaultDataState);

  useEffect(() => {
    const abortController = new AbortController();

    setCapacityData({ ...defaultDataState, loading: true });

    fetchCapacity(abortController, {
      start,
      end,
      miner,
      filter,
    })
      .then((data) => {
        const results = data.map(({ commited, used, total, ...rest }) => ({
          total: Number(total),
          used: Number(used),
          ...rest,
        }));

        setCapacityData({
          ...defaultDataState,
          results,
          failed: false,
        });
      })
      .catch((e) => {
        console.error(e);
        setCapacityData({
          ...defaultDataState,
          failed: true,
        });
      });

    return () => {
      abortController.abort();
    };
  }, [start, end, miner, filter]);

  return (
    <Chart
      title="Filecoin Renewable Energy (V1.0)"
      rangeKey="capacity"
      showMethodologyLink
      interval={filter}
      exportData={{
        filename: `usedVsCommittedCapacity${miner ? `-${miner}` : ''}.csv`,
        fetchFunction: () =>
          fetchCapacity(new AbortController(), {
            start,
            end,
            miner,
            all: true,
          }),
        table: [
          { title: 'Epoch', key: 'epoch' },
          { title: 'Timestamp', key: 'timestamp' },
          { title: 'Used Capacity (GiB)', key: 'used' },
          { title: 'Total Capacity (GiB)', key: 'total' },
        ],
      }}
      data={{
        data: capacityData,
        xData: {
          key: 'start_date',
        },
        yData: {
          type: 'bytes',
        },
        area: [
          {
            key: 'total',
            title: 'REC Capacity Purchased',
          },
          {
            key: 'used',
            title: 'Total Energy Used',
          },
        ],
      }}
    />
  );
};
