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

const units = ['kW', 'MW', 'GW', 'TW', 'PW', 'EW', 'ZW', 'YW'];

export function formatWatts(size, { precision, output, inputUnit } = {}) {
  let n = new BigNumber(size || 0);
  let l = inputUnit && units.includes(inputUnit) ? units.indexOf(inputUnit) : 0;

  while (n.isGreaterThanOrEqualTo(1000) && ++l) {
    n = n.dividedBy(1000);
  }

  if (typeof precision === 'number') {
    n = n.decimalPlaces(precision, BigNumber.ROUND_FLOOR);
  }

  return output === 'object'
    ? {
        unit: units[l],
        value: n.toNumber(),
      }
    : `${n} ${units[l]}`;
}
