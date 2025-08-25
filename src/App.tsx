import React from 'react';
 
/* ============ 2 - Reaproveitamento  de estrutura =========== */
import { Outlet, useLocation } from 'react-router-dom';

/* ============ Styles Global - SCSS/Tailwind =========== */
import './styles/scss/App.scss';
import './styles/scss/base/tailwind.css'

/* ============ Header e Footer - Global =========== */
import Header from './components/global/Header';
import Footer from './components/global/Footer';

const App: React.FC = () => {
    const location = useLocation();

    return (
        <>
            <Header />
                <Outlet />
            <Footer />
        </>
    );
};

export default App;