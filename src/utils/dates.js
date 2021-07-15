import { EPOCH_DURATION, EPOCH_START_TIMESTAMP } from 'constant';

export const convertEpochToTimestamp = (epoch) => {
  return EPOCH_START_TIMESTAMP + Number(epoch) * EPOCH_DURATION;
};

export const convertTimestampToEpoch = (timestamp) => {
  return Math.ceil(
    (Number(timestamp) - EPOCH_START_TIMESTAMP) / EPOCH_DURATION
  );
};
