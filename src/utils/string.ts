import { CHART_SCALE } from 'constant';
import { TChartFiler } from '../api';

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);

export const camelCase = (str) => {
  let string = str
    .toLowerCase()
    .replace(/[^A-Za-z0-9]/g, ' ')
    .split(' ')
    .reduce((result, word) => result + capitalize(word.toLowerCase()));
  return string.charAt(0).toLowerCase() + string.slice(1);
};

export const getCategoryName = (category) => {
  switch (category) {
    case 'energy':
      return 'Energy';
    case 'capacity':
      return 'Capacity';
    default:
      return capitalize(category);
  }
};

export const getNormalizedScale = (keyFromQuery?: string): TChartFiler => {
  const isScaleValid = CHART_SCALE.find(
    (item) => item.queryKey === String(keyFromQuery).toLowerCase()
  );

  if (isScaleValid) {
    // @ts-ignore
    return keyFromQuery.toLowerCase();
  }

  return (
    CHART_SCALE.find((item) => item.isDefault)?.queryKey ||
    CHART_SCALE[0].queryKey
  );
};
