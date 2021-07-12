import { NavLink } from 'react-router-dom';
import cn from 'classnames';

import s from './s.module.css';

export const Tabs = ({ tabs, className }) => {
  return (
    <nav className={cn(s.wrap, className)}>
      {tabs.map((tab, idx) => {
        const handlerClick = (e) => e.preventDefault();

        return (
          <NavLink
            key={idx}
            className={s.tab}
            activeClassName={s.active}
            // onClick={tab.disabled ? handlerClick : tab.onClick}
            onClick={handlerClick}
            {...tab}
          />
        );
      })}
    </nav>
  );
};
