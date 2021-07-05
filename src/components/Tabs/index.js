import { NavLink } from 'react-router-dom';

import s from './s.module.css';

export const Tabs = ({ tabs }) => {
  return (
    <nav className={s.wrap}>
      {tabs.map((tab, idx) => {
        const handlerClick = (e) => e.preventDefault();
        return (
          <NavLink
            key={idx}
            className={s.tab}
            activeClassName={s.active}
            onClick={tab.disabled ? handlerClick : tab.onClick}
            {...tab}
          />
        );
      })}
    </nav>
  );
};
