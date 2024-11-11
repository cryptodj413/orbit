import React from 'react';

interface BentoSideCardProps {
  title: string;
  value: string;
  activityTitle: string;
  activityChart: string;
  activityValue: string;
  activityIcon: string;
}

const BentoSideCard: React.FC<BentoSideCardProps> = ({
  title,
  value,
  activityTitle,
  activityChart,
  activityValue,
  activityIcon,
}) => {
  return (
    <div className="bento-side-content">
      <div className="bento-side-card">
        <h3 className="bento-side-title">{title}</h3>
        <p className="bento-side-value">{value}</p>
      </div>
      <div className="bento-side-activity">
        <h3 className="bento-activity-title">{activityTitle}</h3>
        <img src={activityChart} alt="Activity Chart" className="bento-activity-chart" />
        <div className="bento-activity-stats">
          <span className="bento-activity-value">{activityValue}</span>
          <img src={activityIcon} alt="Activity Icon" className="bento-activity-icon" />
        </div>
      </div>
    </div>
  );
};

export default BentoSideCard;
