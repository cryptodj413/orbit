import React from 'react';

interface BentoStatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
}
const BentoStatCard: React.FC<BentoStatCardProps> = ({ title, value, change, icon }) => {
  return (
    <div className="bento-stat-card">
      <div className="bento-stat-content">
        <div className="bento-stat-container">
          <div className="bento-stat-header">
            <h3 className="bento-stat-title">{title}</h3>
            <span className="bento-stat-change">{change}</span>
          </div>
          <div className="bento-stat-value">
            <span className="bento-stat-amount">{value}</span>
            <img src={icon} alt={title} className="bento-stat-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoStatCard;
