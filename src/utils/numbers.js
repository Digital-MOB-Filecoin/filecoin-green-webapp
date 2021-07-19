import BN from 'bignumber.js';

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const convertNumberToPercent = (value) => {
  return `${new BN(value).multipliedBy(100).toString()}%`;
};
