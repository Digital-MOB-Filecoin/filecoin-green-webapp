import { CHART_CATEGORY } from 'constant';

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
    case CHART_CATEGORY.ENERGY:
      return 'Energy';
    case CHART_CATEGORY.CAPACITY:
      return 'Capacity';
    default:
      return capitalize(category);
  }
};
