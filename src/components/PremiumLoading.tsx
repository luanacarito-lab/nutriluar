import React from 'react';

interface PremiumLoadingProps {
  message?: string;
}

const PremiumLoading: React.FC<PremiumLoadingProps> = ({ message = "Preparando seu espaço de cuidado..." }) => {
  return (
    <div className="premium-loading-container fade-in">
      <div className="premium-loading-moon"></div>
      <p className="premium-loading-text">{message}</p>
      <p className="premium-loading-subtext">A geração do plano pode levar alguns segundos.</p>
    </div>
  );
};

export default PremiumLoading;
