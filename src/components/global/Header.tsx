import React, { useState }  from 'react';
import  { Link } from 'react-router-dom';

import logoLegal from '../../assets/icons/logoLegal.png';

const Header: React.FC = () => {
        const [isMenuOpen, setMenuOpen] = useState(false);
    
        const toggleMenu = () => {
            setMenuOpen(!isMenuOpen);
            console.log('Menu toggled:', !isMenuOpen);
        };
    
         const [isAnswerOpen, setAnswerOpen] = useState(false);
    
        const toggleAnswer = () => {
            setAnswerOpen(!isAnswerOpen);
            console.log('Menu toggled:', !isAnswerOpen);
        };
        
    return (
        <header className="header">
            <nav className={`nav container ${isMenuOpen ? 'active' : ''}`}>
                <article className="nav__logo">
                    <Link to="/" className="nav__logo__link">
                        <img className="nav__logo__img" src={logoLegal} alt="logo Legal" />
                    </Link>
                </article>

                <div className="nav__menu">
                    <ul className="nav__menu__list">
                    
                        <li className="nav__menu__list__item">
                            <Link className="nav__menu__list__item__link" to="#">Plataformas Digitais</Link>
                        </li>
                            
                        <li className="nav__menu__list__item">
                            <Link className="nav__menu__list__item__link" to="#">Contato</Link>
                        </li>

                        <li className="nav__menu__list__item">
                            <Link className="nav__menu__list__item__link" to="#">Quem Somos</Link>
                        </li>
                    </ul>

                    {/* <i className="uil uil-times nav__close" onClick={() => showMenu(!Toggle)}></i> */}
                </div>

                <div className={`nav__toggle ${isMenuOpen ? 'nav__toggle--active' : ''}`}>
                    <i className={`uil uil-times ${isMenuOpen ? '' : 'uil-times--active'}`} onClick={toggleMenu}></i>
                    <i className={`bx bx-menu ${isMenuOpen ? 'bx-menu--active' : ''}`} onClick={toggleMenu}></i>
                </div>
            </nav>
        </header>
    )
}

export default Header;
