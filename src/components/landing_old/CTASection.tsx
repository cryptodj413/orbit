import React from 'react';

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonIcon: string;
  secondaryButtonText: string;
  secondaryButtonSubtext: string;
}

const CTASection: React.FC<CTASectionProps> = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonIcon,
  secondaryButtonText,
  secondaryButtonSubtext,
}) => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <div className="cta-text-container">
            <div className="cta-text">
              <h2 className="cta-title">{title}</h2>
              <p className="cta-subtitle">{subtitle}</p>
            </div>
            <div className="cta-buttons">
              <button className="cta-button">
                <div className="cta-button-content">
                  <div className="cta-button-text">
                    <span className="cta-button-label">{primaryButtonText}</span>
                    <img src={primaryButtonIcon} alt="" className="cta-button-icon" />
                  </div>
                </div>
              </button>
              <button className="cta-secondary-button">
                <div className="cta-secondary-button-content">
                  <span className="cta-secondary-button-label">{secondaryButtonText}</span>
                  <span className="cta-secondary-button-sublabel">{secondaryButtonSubtext}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
