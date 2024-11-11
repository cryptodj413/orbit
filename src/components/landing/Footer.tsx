import React from 'react';

interface FooterProps {
  logoText: string;
  links: string[];
  socialIcons: string[];
}

const Footer: React.FC<FooterProps> = ({ logoText, links, socialIcons }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2 className="footer-logo-text">{logoText}</h2>
        </div>
        <nav className="footer-links">
          {links.map((link, index) => (
            <a key={index} href="#" className="footer-link">
              {link}
            </a>
          ))}
        </nav>
        <div className="footer-social">
          {socialIcons.map((icon, index) => (
            <img
              key={index}
              src={icon}
              alt={`Social icon ${index + 1}`}
              className={`social-icon ${index === 1 ? 'social-icon-discord' : ''}`}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
