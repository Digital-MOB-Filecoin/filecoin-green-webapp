import BN from 'bignumber.js';
import filesize from 'filesize';

export const convertBytesToIEC = (bytes, options = {}) => {
  const bytesBN = new BN(bytes);

  if (bytesBN.isNaN() || !bytesBN.isFinite()) {
    return 'N/A';
  }

  // 1 GiB = 1073741824 bytes
  return filesize(bytesBN.toNumber(), {
    standard: 'iec',
    ...options,
  });
};
