import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, description, loading }) => {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      {loading ? (
        <div className="stat-value">...</div>
      ) : (
        <div className="stat-value">{value}</div>
      )}
      {description && <span className="stat-desc">{description}</span>}
    </div>
  );
};

export default StatCard;
