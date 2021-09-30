import { NavLink } from 'react-router-dom';

import s from './s.module.css';

export const Header = () => {
  return (
    <header className={s.header}>
      <div className="container">
        <div className={s.inner}>
          <NavLink to="/" className={s.logoLink}>
            <h1 className={s.logo}>
              <span>Filecoin</span>
              <span className={s.green}>Green</span>
            </h1>
          </NavLink>
          <nav className={s.nav}>
            <NavLink
              exact
              to="/"
              className={s.navLink}
              activeClassName={s.active}
            >
              <span>Leaderboard</span>
            </NavLink>
            <NavLink
              to="/data"
              className={s.navLink}
              activeClassName={s.active}
            >
              <span>Data</span>
            </NavLink>
            <NavLink
              to="/methodology"
              className={s.navLink}
              activeClassName={s.active}
            >
              <span>Methodology</span>
            </NavLink>
          </nav>
          <div className={s.slack}>
            Feedback? Join <a href="#">#fil-green</a> on Slack!
          </div>
        </div>
      </div>
    </header>
  );
};
