export const filterUniq = (arr: any[]): any[] => {
  return arr.filter((item, pos, self) => self.indexOf(item) === pos);
};
