import BN from 'bignumber.js';

import { EPOCH_DURATION, EPOCH_START_TIMESTAMP } from 'constant';

export const convertEpochToTimestamp = (epoch) => {
  return EPOCH_START_TIMESTAMP + Number(epoch) * EPOCH_DURATION;
};

export const convertTimestampToEpoch = (timestamp) => {
  return new BN(timestamp)
    .minus(EPOCH_START_TIMESTAMP)
    .dividedToIntegerBy(EPOCH_DURATION)
    .toNumber();
};

export const convertTimestampToDate = (timestamp) => {
  return (timestamp.getFullYear() + '-' + (timestamp.getMonth() + 1) + '-' + timestamp.getDate());
};
