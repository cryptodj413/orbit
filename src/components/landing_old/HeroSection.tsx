import React from 'react';

interface HeroSectionProps {
  title: string;
  highlightedText: string;
  subtitle: string;
  learnMoreIcon: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  highlightedText,
  subtitle,
  learnMoreIcon,
}) => {
  return (
    <section className="hero-section">
      <div className="hero-heading">
        <div className="hero-title">
          <div className="hero-title-text">
            <span className="hero-title-part">{title}</span>
            <span className="hero-title-highlight">{highlightedText}</span>
          </div>
        </div>
        <p className="hero-subtitle">{subtitle}</p>
      </div>
      <button className="learn-more-btn">
        Learn more
        <img src={learnMoreIcon} alt="Learn more" className="learn-more-icon" />
      </button>
    </section>
  );
};

export default HeroSection;
