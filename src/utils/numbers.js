import BN from 'bignumber.js';

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const convertNumberToPercent = (value, precision = 5) => {
  BN.config({ DECIMAL_PLACES: precision });
  const valueBN = new BN(value, 10);
  return `${valueBN.multipliedBy(100).toString()}%`;
};
