import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import cn from 'classnames';

import { Svg } from 'components/Svg';
import { IconButton } from 'components/IconButton';
import s from './s.module.css';

const root = document.getElementById('root');

export const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (root && showMobileMenu) {
      root.classList.add('shadow');
    }

    return () => {
      if (root) {
        root.classList.remove('shadow');
      }
    };
  }, [showMobileMenu]);

  return (
    <>
      <header className={s.header}>
        <div className="container">
          <div className={s.inner}>
            <div className={s.headerWrapper}>
              <Link to="/" className={s.logoLink}>
                <h1 className={s.logo}>
                  <span>Filecoin</span>
                  <span className={s.green}>Green</span>
                </h1>
              </Link>
              <IconButton
                onClick={() => setShowMobileMenu((prevState) => !prevState)}
                className={s.menuButton}
              >
                <Svg
                  id={showMobileMenu ? 'navigations_close' : 'navigations_menu'}
                />
              </IconButton>
            </div>
            <nav className={cn(s.nav, { [s.showMobileNav]: showMobileMenu })}>
              <NavLink
                exact
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className={s.navLink}
                activeClassName={s.active}
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
                disabled
                onClick={(e) => e.preventDefault()}
                to="/methodology"
                className={s.navLink}
                activeClassName={s.active}
              >
                <span>Methodology</span>
              </NavLink>
              <div className={s.slack}>
                Feedback? Join <a href="#">#fil-green</a> on Slack!
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};
