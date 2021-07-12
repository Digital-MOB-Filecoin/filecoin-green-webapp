import cn from 'classnames';

import { Svg } from 'components/Svg';

import s from './s.module.css';

export const Search = ({ className, ...rest }) => {
  return (
    <div className={cn(s.wrap, className)}>
      <Svg id="search" className={s.icon} />
      <input type="search" className={s.input} {...rest} />
    </div>
  );
};
