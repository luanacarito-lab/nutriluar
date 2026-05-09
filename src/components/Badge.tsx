import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const Badge: React.FC<BadgeProps> = ({ text, variant = 'primary' }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {text}
    </span>
  );
};

export default Badge;
