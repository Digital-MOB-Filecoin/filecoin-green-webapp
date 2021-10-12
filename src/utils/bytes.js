import BigNumber from 'bignumber.js';
import filesize from 'filesize';

window.filesize = filesize;

export const convertBytesToIEC = (bytes, options = {}) => {
  const bytesBN = new BigNumber(bytes);

  if (bytesBN.isNaN() || !bytesBN.isFinite()) {
    return 'N/A';
  }

  // 1 GiB = 1073741824 bytes
  return filesize(bytesBN.toNumber(), {
    standard: 'iec',
    ...options,
  });
};

/**
 * @typedef {('byte' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB' | 'ZiB' | 'YiB')} formatBytesUnits
 */

/** @type {formatBytesUnits[]} */
const units = ['byte', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

/**
 * @export
 * @param {string|number} size
 * @param {Object} [options]
 * @param {number} [options.precision]
 * @param {'object'} [options.output]
 * @param {formatBytesUnits} [options.inputUnit]
 * @returns {{unit: string, value: number} | string}
 */
export function formatBytes(size, { precision, output, inputUnit } = {}) {
  // let l = 0;
  let n = new BigNumber(size || 0);
  let l = inputUnit && units.includes(inputUnit) ? units.indexOf(inputUnit) : 0;

  if (n.isZero()) {
    return output === 'object'
      ? {
          unit: 'bytes',
          value: 0,
        }
      : '0 bytes';
  }

  while (n.isGreaterThanOrEqualTo(1024) && ++l) {
    n = n.dividedBy(1024);
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
