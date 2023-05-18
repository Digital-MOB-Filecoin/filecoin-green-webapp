import cn from 'classnames';
import { ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';

import s from './s.module.css';

export const Header = (): ReactElement => {
  return (
    <header className={s.header}>
      <div className="container">
        <div className={s.inner}>
          <Link to="/" className={s.logoLink}>
            <h1 className={s.logo}>
              <span>Filecoin</span>
              <span className={s.green}>Green</span>
            </h1>
          </Link>
          <nav className={s.nav}>
            <NavLink
              end
              to="/"
              className={({ isActive }) => cn(s.navLink, { [s.active]: isActive })}
            >
              <span>Data</span>
            </NavLink>
            {/*<NavLink*/}
            {/*  disabled*/}
            {/*  onClick={(e) => e.preventDefault()}*/}
            {/*  to="/leaderboard"*/}
            {/*  className={s.navLink}*/}
            {/*  activeClassName={s.active}*/}
            {/*>*/}
            {/*  <span>Leaderboard</span>*/}
            {/*</NavLink>*/}
            <NavLink
              end
              to="/methodology"
              className={({ isActive }) => cn(s.navLink, { [s.active]: isActive })}
            >
              <span>Methodology</span>
            </NavLink>
          </nav>
          <div className={s.slack}>
            Feedback? Join{' '}
            <a href="https://filecoin.io/slack" target="_blank" rel="noopener noreferrer">
              #fil-green
            </a>{' '}
            on Slack!
          </div>
        </div>
      </div>
    </header>
  );
};
