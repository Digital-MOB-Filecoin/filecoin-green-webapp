import BigNumber from 'bignumber.js';

type TUnit =
  | 'byte'
  | 'KiB'
  | 'MiB'
  | 'GiB'
  | 'TiB'
  | 'PiB'
  | 'EiB'
  | 'ZiB'
  | 'YiB';

const units: TUnit[] = [
  'byte',
  'KiB',
  'MiB',
  'GiB',
  'TiB',
  'PiB',
  'EiB',
  'ZiB',
  'YiB',
];

type TFormatBytesOptions<AsObject> = {
  output?: AsObject;
  precision?: number;
  inputUnit?: TUnit;
  iec?: boolean;
};

export function formatBytes<AsObject extends string>(
  size: string,
  options: TFormatBytesOptions<AsObject> = {}
): AsObject extends 'object' ? { unit: string; value: number } : string {
  const { precision, output, inputUnit, iec } = options;
  // let l = 0;
  let n = new BigNumber(size || 0);
  let l = inputUnit && units.includes(inputUnit) ? units.indexOf(inputUnit) : 0;

  if (n.isZero()) {
    if (output === 'object') {
      // @ts-ignore
      return {
        unit: 'bytes',
        value: 0,
      };
    }
    // @ts-ignore
    return '0 bytes';
  }

  const divider = iec ? 1100 : 1024;
  while (n.isGreaterThanOrEqualTo(divider) && ++l) {
    n = n.dividedBy(divider);
  }

  if (typeof precision === 'number') {
    n = n.decimalPlaces(precision, BigNumber.ROUND_FLOOR);
  }

  if (output === 'object') {
    // @ts-ignore
    return {
      unit: units[l],
      value: n.toNumber(),
    };
  }

  // @ts-ignore
  return `${n} ${units[l]}`;
}
