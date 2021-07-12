import React, { useContext, useState } from 'react';
import sub from 'date-fns/sub';

export const GeneralContext = React.createContext({
  api: (param) => Promise.resolve(param),
  generalSelectors: {
    startDate: null,
    endDate: false,
  },
  generalActions: {
    setStartDate: () => {},
    setEndDate: () => {},
  },
});

export const GeneralProvider = ({ children }) => {
  const [startDate, setStartDate] = React.useState(
    sub(new Date(), { months: 6 })
  );
  const [endDate, setEndDate] = useState(new Date());

  return (
    <GeneralContext.Provider
      value={{
        generalSelectors: {
          startDate,
          endDate,
        },
        generalActions: {
          setStartDate,
          setEndDate,
        },
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = () => useContext(GeneralContext);
