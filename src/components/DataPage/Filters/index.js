import cn from 'classnames';

import s from './s.module.css';

export const Filters = ({ items, className }) => {
  return (
    <nav className={cn(s.wrap, className)}>
      {items.map(({ isActive, ...rest }, idx) => {
        return (
          <button
            key={idx}
            type="button"
            className={cn(s.item, { [s.active]: isActive })}
            {...rest}
          />
        );
      })}
    </nav>
  );
};
