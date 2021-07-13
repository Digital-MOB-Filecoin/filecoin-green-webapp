import BigNumber from 'bignumber.js';
import filesize from 'filesize';

export const convertBytesToIEC = (bytes, options = {}) => {
  const bytesBN = new BigNumber(bytes);

  if (bytesBN.isNaN() || !bytesBN.isFinite()) {
    return 'N/A';
  }

  return filesize(bytesBN.toNumber(), {
    standard: 'iec',
    ...options,
  });
};
