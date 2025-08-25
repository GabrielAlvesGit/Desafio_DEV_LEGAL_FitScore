import React from 'react';

const AuthPage: React.FC = () => {
  return (
    <section className="auth">
      <div className="auth__left">
        <div className="auth__left__company-name">
          Business.IA<span className="auth__left__company-name__circle">●</span>
        </div>
        <p className="auth__left__text">
          Bem-vindo à Business.IA, onde a inovação e a inteligência artificial se unem para impulsionar o sucesso do seu negócio.
        </p>
      </div>
      <div className="auth__right">
        <div className="auth__right__company-name">
          Business.IA<span className="auth__right__company-name__circle">●</span>
        </div>
        <div className="auth__right__start-section">
          <h2 className="auth__right__start-section__title">Get started</h2>
          <div className="auth__right__start-section__buttons">
            <button className="auth__right__start-section__buttons__login button" id="login-btn">Log in</button>
            <button className="auth__right__start-section__buttons__signup button" id="signup-btn">Sign up</button>
          </div>
        </div>
        <div className="auth__right__footer">
          <img className="auth__right__footer__logo" alt="BusinessIA" src="/src/assets/icons/logoBusinessIA.png"/>

          <div className="auth__right__footer__links">
            <a href="#" className="auth__right__footer__links__item">Terms of use</a>
            <span className="auth__right__footer__links__separator">|</span>
            <a href="#" className="auth__right__footer__links__item">Privacy policy</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;