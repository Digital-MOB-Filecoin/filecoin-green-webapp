import BigNumber from 'bignumber.js';

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
 * @param {boolean} [options.iec]
 * @param {'object'} [options.output]
 * @param {formatBytesUnits} [options.inputUnit]
 * @returns {{unit: string, value: number} | string}
 */
export function formatBytes(size, { precision, output, inputUnit, iec } = {}) {
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

  const divider = iec ? 1100 : 1024;
  while (n.isGreaterThanOrEqualTo(divider) && ++l) {
    n = n.dividedBy(divider);
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
