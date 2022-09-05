import BN from 'bignumber.js';
import BigNumber from 'bignumber.js';

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const convertNumberToPercent = (value, precision = 5) => {
  BN.config({ DECIMAL_PLACES: precision });
  const valueBN = new BN(value, 10);
  return `${valueBN.multipliedBy(100).toString()}%`;
};

export const formatNumber = (value, precision = 3) => {
  BN.config({ DECIMAL_PLACES: precision });
  const valueBN = new BN(value, 10);

  return valueBN.toString();
};

const wattsUnits = ['kW', 'MW', 'GW', 'TW', 'PW', 'EW', 'ZW', 'YW'];

export function formatWatts(size, { precision, output, inputUnit } = {}) {
  let n = new BigNumber(size || 0);
  let l =
    inputUnit && wattsUnits.includes(inputUnit)
      ? wattsUnits.indexOf(inputUnit)
      : 0;

  while (n.isGreaterThanOrEqualTo(1000) && ++l) {
    n = n.dividedBy(1000);
  }

  if (typeof precision === 'number') {
    n = n.decimalPlaces(precision, BigNumber.ROUND_FLOOR);
  }

  return output === 'object'
    ? {
        unit: wattsUnits[l],
        value: n.toNumber(),
      }
    : `${n} ${wattsUnits[l]}`;
}

const CO2Units = ['gC02', 'kgCO2', 'tCO2', 'MtCO2', 'GtCO2'];

export function formatCO2(size, { precision, output, inputUnit } = {}) {
  let n = new BigNumber(size || 0);
  let l =
    inputUnit && CO2Units.includes(inputUnit) ? CO2Units.indexOf(inputUnit) : 0;

  while (n.isGreaterThanOrEqualTo(1000) && ++l) {
    n = n.dividedBy(1000);
  }

  if (typeof precision === 'number') {
    n = n.decimalPlaces(precision, BigNumber.ROUND_FLOOR);
  }

  return output === 'object'
    ? {
        unit: CO2Units[l],
        value: n.toNumber(),
      }
    : `${n} ${CO2Units[l]}`;
}
