import BN from 'bignumber.js';
import filesize from 'filesize';

export const convertBytesToIEC = (bytes, options = {}) => {
  const bytesBN = new BN(bytes);

  if (bytesBN.isNaN() || !bytesBN.isFinite()) {
    return 'N/A';
  }

  return filesize(bytesBN.toNumber(), {
    standard: 'iec',
    ...options,
  });
};
