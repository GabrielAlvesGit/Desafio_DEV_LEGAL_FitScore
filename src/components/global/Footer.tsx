import React, { useState } from 'react';

const Footer: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAnswer = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <footer className="footer">
            <div className="container">
              footer
            </div>
        </footer>
    )
}

export default Footer;
