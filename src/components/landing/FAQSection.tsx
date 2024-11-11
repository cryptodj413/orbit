import React from 'react';

interface FAQItem {
  question: string;
  icon: string;
}

interface FAQSectionProps {
  title: string;
  faqItems: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ title, faqItems }) => {
  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-content">
          <div className="faq-header">
            <h2 className="faq-title">{title}</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <p className="faq-question">{item.question}</p>
                <img src={item.icon} alt="" className="faq-icon" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
