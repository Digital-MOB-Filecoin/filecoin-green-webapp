import { NavLink } from 'react-router-dom';
import cn from 'classnames';

import s from './s.module.css';

export const Tabs = ({
  tabs = [
    {
      to: '/',
      exact: true,
      children: 'Capacity Committed and Used',
    },
    {
      to: '/energy',
      children: 'Energy',
      disabled: true,
    },
    {
      to: '/carbon',
      children: 'Carbon intensity',
      disabled: true,
    },
  ],
  className,
}) => {
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
