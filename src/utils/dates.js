import { EPOCH_DURATION, EPOCH_START_TIMESTAMP } from 'constant';

export const convertEpochToTimestamp = (epoch) => {
  return (EPOCH_START_TIMESTAMP + Number(epoch) * EPOCH_DURATION) * 1000;
};

export const convertTimestampToEpoch = (timestamp) => {
  return (
    Math.trunc(Number(timestamp) / 1000 - EPOCH_START_TIMESTAMP) /
    EPOCH_DURATION
  );
};
