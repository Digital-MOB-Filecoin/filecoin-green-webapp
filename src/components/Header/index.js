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
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/about"
              className={s.navLink}
              activeClassName={s.active}
            >
              <span>About</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
