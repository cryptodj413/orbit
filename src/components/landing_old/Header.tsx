import React from 'react';

interface HeaderProps {
  logo: string;
  navLinks: string[];
}

const Header: React.FC<HeaderProps> = ({ logo, navLinks }) => {
  return (
    <header className="header">
      <div className="header-content">
        <img src={logo} alt="Logo" className="logo" />
        <nav className="nav-links">
          {navLinks.map((link, index) => (
            <a key={index} href="#" className="nav-link">
              {link}
            </a>
          ))}
        </nav>
        <button className="launch-app-btn">Launch App</button>
      </div>
    </header>
  );
};

export default Header;
