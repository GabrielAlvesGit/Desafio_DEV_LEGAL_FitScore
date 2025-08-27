import React, { useEffect } from 'react';

const ScrollUp: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scroll = document.querySelector('.js-scroll');
      if (scroll) {
        if (window.scrollY > 50) {
          scroll.classList.add('active');
        } else {
          scroll.classList.remove('active');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <a className="scrollup js-scroll" href="#header">
      <svg
        className="uil uil-arrow-up scrollup__icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{ fill: 'hsl(238 97% 36%)' }}
      >
        <path d="M13 18v-6h5l-6-7-6 7h5v6z" />
      </svg>
    </a>
  );
};

export default ScrollUp;