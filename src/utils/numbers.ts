import BigNumber from 'bignumber.js';

export const convertNumberToPercent = (value: string | number, precision = 5): string => {
  BigNumber.config({ DECIMAL_PLACES: precision });
  const valueBN = new BigNumber(value, 10);
  return `${valueBN.multipliedBy(100).toString()}%`;
};

export const formatNumber = (value: string | number, precision = 3): string => {
  BigNumber.config({ DECIMAL_PLACES: precision });
  const valueBN = new BigNumber(value, 10);

  return valueBN.toString();
};

type TWattsUnit = 'kW' | 'MW' | 'GW' | 'TW' | 'PW' | 'EW' | 'ZW' | 'YW';
const wattsUnits: TWattsUnit[] = ['kW', 'MW', 'GW', 'TW', 'PW', 'EW', 'ZW', 'YW'];

type TFormatWattsOptions = {
  precision?: number;
  output?: 'object';
  inputUnit?: TWattsUnit;
};
export function formatWatts(
  size: string,
  options: TFormatWattsOptions = {}
):
  | string
  | {
      unit: TWattsUnit;
      value: number;
    } {
  const { precision, output, inputUnit } = options;

  let n = new BigNumber(size || 0);
  const isNegative = n.isNegative();
  let l = inputUnit && wattsUnits.includes(inputUnit) ? wattsUnits.indexOf(inputUnit) : 0;

  if (isNegative) {
    while (n.isLessThanOrEqualTo(-1000) && ++l) {
      n = n.dividedBy(1000);
    }
  } else {
    while (n.isGreaterThanOrEqualTo(1000) && ++l) {
      n = n.dividedBy(1000);
    }
  }

  if (typeof precision === 'number') {
    n = n.decimalPlaces(precision, BigNumber.ROUND_FLOOR);
  }

  const unit = wattsUnits[l];

  return output === 'object'
    ? {
        unit,
        value: n.toNumber(),
      }
    : `${n} ${unit}`;
}

type TCO2Unit = 'gC02' | 'kgCO2' | 'tCO2' | 'MtCO2' | 'GtCO2';
const CO2Units: TCO2Unit[] = ['gC02', 'kgCO2', 'tCO2', 'MtCO2', 'GtCO2'];

type TFormatCO2Options = {
  precision?: number;
  output?: 'object';
  inputUnit?: TCO2Unit;
};

export function formatCO2(
  size: string | number,
  options: TFormatCO2Options = {}
):
  | string
  | {
      unit: TFormatCO2Options['inputUnit'];
      value: number;
    } {
  const { precision, output, inputUnit } = options || {};
  let n = new BigNumber(size || 0);
  const isNegative = n.isNegative();
  let l = inputUnit && CO2Units.includes(inputUnit) ? CO2Units.indexOf(inputUnit) : 0;

  if (isNegative) {
    while (n.isLessThanOrEqualTo(-1000) && ++l) {
      n = n.dividedBy(1000);
    }
  } else {
    while (n.isGreaterThanOrEqualTo(1000) && ++l) {
      n = n.dividedBy(1000);
    }
  }

  if (typeof precision === 'number') {
    n = n.decimalPlaces(precision, BigNumber.ROUND_FLOOR);
  }

  const unit = CO2Units[l];

  return output === 'object'
    ? {
        unit,
        value: n.toNumber(),
      }
    : `${n} ${unit}`;
}
