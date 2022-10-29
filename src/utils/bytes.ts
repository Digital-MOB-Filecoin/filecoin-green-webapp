import BigNumber from 'bignumber.js';

const units = ['byte', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

type TFormatBytesOptions = {
  precision?: number;
  output?: 'object' | string;
  inputUnit?:
    | 'byte'
    | 'KiB'
    | 'MiB'
    | 'GiB'
    | 'TiB'
    | 'PiB'
    | 'EiB'
    | 'ZiB'
    | 'YiB';
  iec?: boolean;
};

type FormatBytesOf<T> = T extends string
  ? {
      unit: string;
      value: number;
    }
  : string;

export function formatBytes(
  size,
  options: TFormatBytesOptions
): FormatBytesOf<TFormatBytesOptions['output']> {
  const { precision, output, inputUnit, iec } = options;
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
