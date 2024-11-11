import React from 'react';
import BentoStatCard from './BentoStatCard';
import BentoSideCard from './BentoSideCard';

interface BentoSectionProps {
  stats: {
    title: string;
    value: string;
    change: string;
    icon: string;
  }[];
  sideCardData: {
    title: string;
    value: string;
    activityTitle: string;
    activityChart: string;
    activityValue: string;
    activityIcon: string;
  };
}

const BentoSection: React.FC<BentoSectionProps> = ({ stats, sideCardData }) => {
  return (
    <section className="bento-section">
      <div className="bento-container">
        <div className="bento-main-column">
          <div className="bento-main-content">
            <div className="bento-stats">
              {stats.map((stat, index) => (
                <BentoStatCard key={index} {...stat} />
              ))}
            </div>
            <div className="bento-chart">
              <div className="bento-chart-content">{/* Chart content goes here */}</div>
            </div>
          </div>
        </div>
        <div className="bento-side-column">
          <BentoSideCard {...sideCardData} />
        </div>
      </div>
    </section>
  );
};

export default BentoSection;
