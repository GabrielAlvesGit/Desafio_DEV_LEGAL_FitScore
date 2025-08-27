import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoLegal from '../../assets/icons/logoLegal.png';

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); 
  const toggleRef = useRef<HTMLDivElement>(null); 
  const location = useLocation(); 

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        toggleRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className="header">
      <nav className={`nav ${isMenuOpen ? 'nav--active' : ''} container`}>
        <article className="nav__logo">
          <Link to="/" className="nav__logo__link">
            <img className="nav__logo__img" src={logoLegal} alt="logo Legal" />
          </Link>
        </article>

        <div
          className={`nav__menu ${isMenuOpen ? 'nav__menu--active' : ''}`}
          tabIndex={0}
          ref={menuRef}
        >
          <ul className="nav__menu__list">
            <li className="nav__menu__list__item">
              <Link
                className="nav__menu__list__item__link"
                to="/"
                onClick={closeMenu} // Fechar menu ao clicar no link
              >
                <i className="bx bx-tachometer"></i> FitScore
              </Link>
            </li>
            <li className="nav__menu__list__item">
              <Link
                className="nav__menu__list__item__link"
                to="/Dashboard"
                onClick={closeMenu} // Fechar menu ao clicar no link
              >
                <i className="bx bx-line-chart"></i> Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div
          className={`nav__toggle ${isMenuOpen ? 'nav__toggle--active' : ''}`}
          ref={toggleRef}
        >
          <i
            className={`uil uil-times ${isMenuOpen ? '' : 'uil-times--active'}`}
            onClick={toggleMenu}
          ></i>
          <i
            className={`bx bx-menu ${isMenuOpen ? 'bx-menu--active' : ''}`}
            onClick={toggleMenu}
          ></i>
        </div>
      </nav>
    </header>
  );
};

export default Header;