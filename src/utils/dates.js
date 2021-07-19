import BN from 'bignumber.js';

import { EPOCH_DURATION, EPOCH_START_TIMESTAMP } from 'constant';

export const convertEpochToTimestamp = (epoch, toUnix) => {
  const result = EPOCH_START_TIMESTAMP + Number(epoch) * EPOCH_DURATION;

  return toUnix ? Math.trunc(result / 1000) : result;
};

export const convertTimestampToEpoch = (timestamp) => {
  return new BN(timestamp)
    .minus(EPOCH_START_TIMESTAMP)
    .dividedToIntegerBy(EPOCH_DURATION)
    .toNumber();
};
