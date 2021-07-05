import { Svg } from 'components/Svg';

import s from './s.module.css';

export const Search = ({ ...rest }) => {
  return (
    <div className={s.wrap}>
      <Svg id="search" className={s.icon} />
      <input type="search" className={s.input} {...rest} />
    </div>
  );
};
