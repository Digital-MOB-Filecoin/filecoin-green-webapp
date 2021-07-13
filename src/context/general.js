import React, { useContext, useState, useEffect } from 'react';
import sub from 'date-fns/sub';

import { api } from 'utils/api';
// import { EPOCH_START_TIMESTAMP, EPOCH_DURATION } from 'constant';

export const GeneralContext = React.createContext({
  generalSelectors: {
    startDate: null,
    endDate: false,
    usedCapacityData: [],
  },
  generalActions: {
    setStartDate: () => {},
    setEndDate: () => {},
    fetchUsedCapacityData: () => {},
  },
});

const defaultDataState = {
  results: {},
  loading: false,
  failed: false,
};

export const GeneralProvider = ({ children }) => {
  const [usedCapacityData, setUsedCapacityData] = useState(defaultDataState);
  const [startDate, setStartDate] = React.useState(
    sub(new Date(), { months: 6 })
  );
  const [endDate, setEndDate] = useState(new Date());

  const fetchUsedCapacityData = async (abortController) => {
    return await api(
      'network',
      abortController ? { signal: abortController.signal } : {}
    );
  };

  useEffect(() => {
    setUsedCapacityData({
      ...defaultDataState,
      loading: true,
    });

    const abortController = new AbortController();

    fetchUsedCapacityData(abortController)
      .then((results) => {
        // const startDateInEpoch = Math.trunc(
        //   (startDate.getTime() / 1000 - EPOCH_START_TIMESTAMP) / EPOCH_DURATION
        // );
        // const endDateInEpoch = Math.trunc(
        //   (endDate.getTime() / 1000 - EPOCH_START_TIMESTAMP) / EPOCH_DURATION
        // );

        setUsedCapacityData({
          ...defaultDataState,
          // results: results.filter((el) => {
          //   return (
          //     Number(el.epoch) >= startDateInEpoch &&
          //     Number(el.epoch) <= endDateInEpoch
          //   );
          // }),
          results: results.slice(0, 200).map(({ epoch, commited, used }) => ({
            epoch: Number(epoch),
            commited: Number(commited),
            used: Number(used),
          })),
          loaded: true,
        });
      })
      .catch((e) => {
        console.error(e);
        setUsedCapacityData({
          ...defaultDataState,
          failed: true,
        });
      });

    return function cancel() {
      abortController.abort();
    };
  }, [startDate.getTime(), endDate.getTime()]);

  return (
    <GeneralContext.Provider
      value={{
        generalSelectors: {
          startDate,
          endDate,
          usedCapacityData,
        },
        generalActions: {
          setStartDate,
          setEndDate,
          fetchUsedCapacityData,
        },
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = () => useContext(GeneralContext);
